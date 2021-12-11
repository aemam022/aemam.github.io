---
layout: page
title: Building Polarization Networks
description: A Data Story
background: '/img/bg-about.jpg'
---

## Context

In this project, we are going to analyze data from an experiment about *honesty*. 
Oftentimes, we are asked to confirm our honest intentions by signing **at the end** of a document. 
For example, in tax returns or insurance policy forms, we are often asked to sign our names under a text that reads 
something like "I hereby certify that the above statements are true and correct to the best of my knowledge."

However, when individuals sign **after** lying in the form, they may not feel the need to correct the falsehoods they 
have reported. In that context, it could be that signing at **the beginning** rather than at the end of the document 
would decrease dishonesty, as those who are filling the form would be aware of the ethical requirements *before* they 
provide the information in the form.

This intuition has led researchers to partner up with a motorcycle insurance company to run a randomized experiment. 
In this insurance company (as well as in many others), customers had to report the exact *odometer kilometrage*¹ in 
order for the company to adjust the insurance premiums. Note that motorcycles with lower kilometrage are less likely to 
have issues, and thus will result in a lower *insurance premium*². Therefore, customers have an incentive to lie, 
reporting a kilometrage lower than the real value, in order to save money.

In the experiment, two different forms were created: one where the signing was done at the end, and another where the 
signing was done at the beginning. The insurance company then randomized these forms (i.e., each customer received
 exactly one form, each with probability 50%) and sent back the data that customers had provided. Some noteworthy 
 details on the experiment are that:

- All customers involved in the experiment already had a contract with the company and were simply renewing it. 
In the data that the company provided, they also report the odometer kilometrage for their previous contract.
Each policy, therefore, contains two contracts: the "updated" contract —where the experiment was conducted— and 
the "baseline" contract, which was the previous contract customers had with the company.
- A single insurance policy can insure up to 4 distinct motorcycles.

In this assignment, you will take the role of the researcher and work analyzing this data!

*Glossary:*
1. **odometer kilometrage:** the total distance the motorcycle has traveled.
2. **insurance premiums:** the amount of money one pays for an insurance policy.

---

## The data

The company provided you with a compressed `.tsv` file containing one row per policy. 
The `.tsv` has the following fields:

- `condition`: either `Sign Top` or `Sign Bottom`, depending on which form was sent.
- `id`: unique identifier for each insurance policy.
- `motorcycle_count`: number of motorcycles covered by the insurance policy.
- `baseline_motorcycle[1-4]`: odometer kilometrage *reported by the customer* in the *previous (baseline)* contract. 
- `update_motorcycle[1-4]`: odometer kilometrage *reported by the customer* in the *current (updated)* contract.

Some comments:

- Recall that a single policy can ensure up to 4 motorcycles, and thus, the suffixes [1-4] indicate that there are 4 
versions of these columns in the data (e.g., `baseline_motorcycle1`, `baseline_motorcycle2`, `baseline_motorcycle3`, 
`baseline_motorcycle4`). 
- When a policy has fewer than 4 motorcycles, only the columns with the smaller numerals are filled (e.g., if a policy 
insures one motorcycle,  only `baseline_motorcycle1` and `update_motorcycle1` will be filled).
- Note that we only have access to the odometer kilometrage reported by the customers, 
which may be different from the real kilometrage of the motorcycles.


```python
# Imports you may need
import seaborn as sns
from IPython.display import display, HTML
import matplotlib.pyplot as plt
import scipy.stats as stats
import pandas as pd
import numpy as np

import matplotlib as mpl
import matplotlib.ticker as tick
```


```python
# Visualization parameters

mpl.rcParams['figure.dpi']= 100
pd.set_option('display.max_rows', 3000)
sns.set(style="darkgrid")

COLOR1 = (0.2980392156862745, 0.4470588235294118, 0.6901960784313725, 0.5)
COLOR2 = (0.8666666666666667, 0.5176470588235295, 0.3215686274509804, 0.5)

def reformat_large_tick_values(tick_val, pos):
    """
    Turns large tick values (in the billions, millions and thousands) 
    such as 4500 into 4.5K and also appropriately turns 4000 into 4K 
    (no zero after the decimal).
    """
    if tick_val >= 1e9:
        val = round(tick_val/1000000000, 1)
        new_tick_format = '{:}B'.format(val)
    elif tick_val >= 1e6:
        val = round(tick_val/1000000, 1)
        new_tick_format = '{:}M'.format(val)
    elif tick_val >= 1e3:
        val = round(tick_val/1000, 1)
        new_tick_format = '{:}K'.format(val)
    elif tick_val < 1e3:
        new_tick_format = round(tick_val, 1)
    else:
        new_tick_format = tick_val

    # make new_tick_format into a string value
    new_tick_format = str(new_tick_format)
    
    # code below will keep 4.5M as is but change values such as 4.0M to 4M since that zero after the decimal isn't needed
    index_of_decimal = new_tick_format.find(".")
    
    if index_of_decimal != -1:
        value_after_decimal = new_tick_format[index_of_decimal+1]
        if value_after_decimal == "0":
            # remove the 0 after the decimal point since it's not needed
            new_tick_format = new_tick_format[0:index_of_decimal] + new_tick_format[index_of_decimal+2:]
            
    return new_tick_format

```

### **Task 1** — 4pts

Your first task is to load the dataset into memory using pandas. 
**You should load the data directly from the compressed files.**

Here, the files at hand are rather small, and you could easily uncompress the files to disk and work with them as plain 
text. Why, then, are we asking you to load the files compressed? The reason is that, in your life as a data scientist, 
this will often not be the case. Then, working with compressed files is key so that you don't receive email from your 
(often more responsible) colleagues demanding to know how you have managed to fill the entire cluster with your 
datasets. Another big advantage of compressing files is to simply read files faster. You will often find that reading
compressed data on the fly (uncompressing it as you go), is much faster than reading uncompressed data, since reading
and writing to disk may be your [bottleneck](https://skipperkongen.dk/2012/02/28/uncompressed-versus-compressed-read/). 

---

**Hint:** `pandas` can open compressed files.

**Hint:** In the real world (and in ADA-homework), your file often comes with some weird lines! 
This time you can safely ignore them (but in the real world you must try to understand why they are there!). 
Check the `error_bad_lines` or the `on_bad_lines` (depending on your pandas version) parameter on `read_csv`.


```python
DATA_FOLDER = 'data/'
DATASET = DATA_FOLDER+"data.tsv.gz"

# skip bad lines and warn which
df = pd.read_csv(DATASET, compression='gzip', sep='\t', on_bad_lines = 'warn')
df['condition'] = df.condition.astype('category')
df['motorcycle_count'] = df.motorcycle_count.astype('category')

df.head()
```

    b'Skipping line 2142: expected 11 fields, saw 27\n'





<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>condition</th>
      <th>id</th>
      <th>baseline_motorcycle1</th>
      <th>update_motorcycle1</th>
      <th>baseline_motorcycle2</th>
      <th>update_motorcycle2</th>
      <th>baseline_motorcycle3</th>
      <th>update_motorcycle3</th>
      <th>baseline_motorcycle4</th>
      <th>update_motorcycle4</th>
      <th>motorcycle_count</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Sign Top</td>
      <td>1</td>
      <td>896</td>
      <td>39198</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Sign Bottom</td>
      <td>2</td>
      <td>21396</td>
      <td>63511</td>
      <td>32659.0</td>
      <td>47605.0</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>2</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Sign Bottom</td>
      <td>3</td>
      <td>21340</td>
      <td>37460</td>
      <td>44998.0</td>
      <td>59002.0</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>2</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Sign Bottom</td>
      <td>4</td>
      <td>23912</td>
      <td>59136</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>1</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Sign Bottom</td>
      <td>5</td>
      <td>16862</td>
      <td>59292</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
</div>



### Task 2 — 12pts

As a good data scientist, the first thing you do is to clean up the data and perform some small sanity checks.

**Hint:** Here we are considering as outliers numbers that are not plausible in the context of motorcycle kilometrages.

---

1. The motorcycle insurance company mentioned that each policy has a unique identifier, but that there may be duplicate 
rows (i.e., multiple rows with the same policy identifier). Check if there are duplicate policies and, if so, filter 
these rows from the data (always keeping the first).


```python
before = df.shape[0]
df = df.drop_duplicates(keep='first')
print('We removed {} duplicate rows'.format(before-df.shape[0]))
```

    We removed 8 duplicate rows


2. According to the company, all policies should have kept the number of motorcycles from the previous contract (i.e., 
the number of motorcycles recorded in baseline contracts should equal the number of motorcycles in updated contracts). 
Also, the number of odometer readings for each contract should be the same as the number stated in the 
`motorcycle_count` variable. Check the data to see if these two things hold. If not, filter the anomalous rows.

<font color = "DarkCyan">
First, let's check that the numbers of motorcycles don't change. 

With boolean logic over columns, we'll check that, for $1\le k \le 4$, if either `baseline_motorcycle{k}` or `update_motorcycle{k}` is $\texttt{NaN}$, then both are.
</font>


```python
to_delete = []
for k in range(1,5):
    bl = df[f'baseline_motorcycle{k}']
    ud = df[f'update_motorcycle{k}']
    #if at least one is NaN but not both 
    new_to_delete = df.index[(bl.isna() | ud.isna()) & ~ (bl.isna() & ud.isna())]
    to_delete.extend(new_to_delete.to_numpy())

print('There are {} rows that should be removed, based on a fact that\n'.format(len(to_delete))\
      +'each baseline_motorcycle{k} and update_motorcycle{k} are either both Nan or both not.')
```

    There are 0 rows that should be removed, based on a fact that
    each baseline_motorcycle{k} and update_motorcycle{k} are either both Nan or both not.


<font color = "DarkCyan">
So we can see that no row present this specific anomaly in this dataset.
    
Now let's check that `motorcycle_count` is the same as the actual number of motorcycles. Since we know that the number of motorcycles in update and baseline contracts is now consistent, we can simply use the baseline number.
We'll sum the number of baseline podometers that are not NaNs for each row, and compare it to `motorcycle_count`.
</font>


```python
actual_count = df[[f'baseline_motorcycle{k}' for k in range(1,5)]].notna().sum(axis=1)
to_drop = df.index[(actual_count != df.motorcycle_count)]
print(to_drop)
df.drop(to_drop, inplace=True)
```

    Int64Index([], dtype='int64')


3. Calculate the mean and the median value of each column related to kilometrages. Are the values obtained plausible? 
Visualize the distribution of the data and remove any extreme outliers.


```python
df.iloc[:,2:-1].describe().loc[['mean', '50%']]
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>baseline_motorcycle1</th>
      <th>update_motorcycle1</th>
      <th>baseline_motorcycle2</th>
      <th>update_motorcycle2</th>
      <th>baseline_motorcycle3</th>
      <th>update_motorcycle3</th>
      <th>baseline_motorcycle4</th>
      <th>update_motorcycle4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>mean</th>
      <td>7.413448e+14</td>
      <td>7.413448e+14</td>
      <td>67324.756948</td>
      <td>92277.813595</td>
      <td>67657.320282</td>
      <td>92849.408771</td>
      <td>67827.97546</td>
      <td>93374.279141</td>
    </tr>
    <tr>
      <th>50%</th>
      <td>5.633500e+04</td>
      <td>8.238800e+04</td>
      <td>56158.000000</td>
      <td>82066.000000</td>
      <td>58821.000000</td>
      <td>85645.000000</td>
      <td>68181.00000</td>
      <td>93387.500000</td>
    </tr>
  </tbody>
</table>
</div>




```python
fig, ax = plt.subplots(4,2,figsize= (11,7), sharex = 'row', sharey = 'row')

for i in range(8):
    sbplt = ax[i//2, i%2]
    sbplt.hist(df.iloc[:,i+2], bins = 100)
    sbplt.set_title(df.columns[i+2])
    
fig.tight_layout(pad=0.5)
fig.subplots_adjust(top=0.9)

fig.text(0.45,-0.01, "Number of km");
fig.text(0,0.4, "Number of policies", rotation = 90);
plt.suptitle('Distribution of km for each category');
```


    
![png](output_15_0.png)
    


<font color = 'DarkCyan'>
We first choose to exclude all the data with any kilometrage higher than 10M, because it is way to high for a coherent lifetime of a motorcycle.
</font>


```python
#Removing all rows were there is a odometer reading greater than 1e7
#DataFrame.ge(threshold) a DataFrame of the same shape of True/False depending
# if the value is greater or not than the threshold in input.
#.any(axis=1) returns whether any element over each row is True
#.ge(threshold).any(axis=1) gives the rows that have a least one value greater than the threshold
# using ~ (NOT) allows us to keep all the raws without any values superior to the fixed threshold


df = df[~df.iloc[:,2:9].ge(1e7).any(axis = 1)]
```


```python
df.iloc[:,2:10].plot.box(figsize=(20,10)) 
plt.ylabel('Kilometrage')
plt.title('Distribution of km for the different categories');
```


    
![png](output_18_0.png)
    


<font color='DarkCyan'>
We chose to keep odometer readings under 300.000km, as it is already a huge value of life time for a motorcycle.
</font> 


```python
limit = 300000
df = df[~df.iloc[:,2:9].ge(limit).any(axis = 1)]
```


```python
df.iloc[:,2:-1].describe().loc[['mean','50%']]
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>baseline_motorcycle1</th>
      <th>update_motorcycle1</th>
      <th>baseline_motorcycle2</th>
      <th>update_motorcycle2</th>
      <th>baseline_motorcycle3</th>
      <th>update_motorcycle3</th>
      <th>baseline_motorcycle4</th>
      <th>update_motorcycle4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>mean</th>
      <td>65642.428049</td>
      <td>90544.518333</td>
      <td>65832.600465</td>
      <td>90787.770647</td>
      <td>66029.199521</td>
      <td>91170.264964</td>
      <td>67006.26087</td>
      <td>92589.928571</td>
    </tr>
    <tr>
      <th>50%</th>
      <td>55943.000000</td>
      <td>81843.000000</td>
      <td>56001.500000</td>
      <td>81701.000000</td>
      <td>58117.000000</td>
      <td>85299.000000</td>
      <td>65550.00000</td>
      <td>92844.500000</td>
    </tr>
  </tbody>
</table>
</div>




```python
fig, ax = plt.subplots(4,2,figsize= (11,7), sharex = True, sharey = 'row')

for i in range(8):
    sbplt = ax[i//2, i%2]
    sbplt.hist(df.iloc[:,i+2], bins=range(0, limit + 10000, 5000))
    sbplt.set_title(df.columns[i+2])
    sbplt.xaxis.set_major_formatter(tick.FuncFormatter(reformat_large_tick_values));

fig.tight_layout(pad=0.5)
fig.subplots_adjust(top=0.9)

fig.text(0.45,-0.01, "Number of km");
fig.text(0,0.4, "Number of policies", rotation = 90);

plt.suptitle('Distribution of data for the different categories after filtering');
```


    
![png](output_22_0.png)
    


4. **Discuss:** In cases where you cannot think of appropriate ways to remove outliers, would you prefer summarizing 
numerical data with outliers with the mean or the median? Why?
---
<font color='DarkCyan'>
We would rather choose the median because the mean is strongly influenced by outliers if they are large values (regarding the original distribution). For the median, having few outliers just shift the rank of the value obtained, which doesn't change too much the order of magnitude.


In cases where you cannot think of appropriate ways to remove outliers, it would be better to summarize the numerical data with the median as it would be a better representative of the shape and occurrence of the data than the mean which will be skewed by the outliers.</font>



### Task 3 — 12pts

One of the challenges with the current data is that it is not clear how to handle policies with multiple motorcycles.

---

1. Create three additional columns in the dataframe, `baseline_average`, `update_average`, and `diff_average`. These 
should contain, respectively, the average value for `baseline_motorcycle[1-4]` for all motorcycles insured; the average
 value for `update_motorcycle[1-4]`; and the difference between the average updated value and the average baseline 
 value.


```python
#To select the columns on wich we apply the mean, we use condition on their name.
df['baseline_average'] = df[df.columns[pd.Series(df.columns).str.startswith('baseline')]].mean(axis=1)
df['update_average'] = df[df.columns[pd.Series(df.columns).str.startswith('update')]].mean(axis=1)
df['diff_average'] = df.update_average - df.baseline_average 
df.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>condition</th>
      <th>id</th>
      <th>baseline_motorcycle1</th>
      <th>update_motorcycle1</th>
      <th>baseline_motorcycle2</th>
      <th>update_motorcycle2</th>
      <th>baseline_motorcycle3</th>
      <th>update_motorcycle3</th>
      <th>baseline_motorcycle4</th>
      <th>update_motorcycle4</th>
      <th>motorcycle_count</th>
      <th>baseline_average</th>
      <th>update_average</th>
      <th>diff_average</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Sign Top</td>
      <td>1</td>
      <td>896</td>
      <td>39198</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>1</td>
      <td>896.0</td>
      <td>39198.0</td>
      <td>38302.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Sign Bottom</td>
      <td>2</td>
      <td>21396</td>
      <td>63511</td>
      <td>32659.0</td>
      <td>47605.0</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>2</td>
      <td>27027.5</td>
      <td>55558.0</td>
      <td>28530.5</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Sign Bottom</td>
      <td>3</td>
      <td>21340</td>
      <td>37460</td>
      <td>44998.0</td>
      <td>59002.0</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>2</td>
      <td>33169.0</td>
      <td>48231.0</td>
      <td>15062.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Sign Bottom</td>
      <td>4</td>
      <td>23912</td>
      <td>59136</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>1</td>
      <td>23912.0</td>
      <td>59136.0</td>
      <td>35224.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>Sign Bottom</td>
      <td>5</td>
      <td>16862</td>
      <td>59292</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>1</td>
      <td>16862.0</td>
      <td>59292.0</td>
      <td>42430.0</td>
    </tr>
  </tbody>
</table>
</div>

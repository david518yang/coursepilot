# CMSI 5350/EECE 5998

# Machine Learning

# Dr. Mandy Korpusik

The instructor gratefully acknowledges Alex Wong (Yale), Jessica Wu (HMC), and the many others who made their course materials freely available online.

Robot Image Credit: Viktoriya Sukhanova © 123RF.com
# From last time… NumPy

import   numpy   as  np

X  = np.zeros((5,     4,  3))
print(X.shape)

X[:,   :, 0]  =  1 #  Reminder:    What   did  this  do?
X[...,   1:3]   = [2,  3]  #  And  this?
X  = np.reshape(X,     (-1,   5))  #  What’s   the  shape?

def  global_mean(x):
return   np.sum(x)    /  np.prod(x.shape)

global_mean(X)     #  What   do we  expect   for   the  mean?
np.mean(X)    #  Let’s   check  it
# Resources for NumPy

https://numpy.org/doc/stable/user/quickstart

# NumPy

- User Guide
- API reference
- Building from source
- Development
- Release notes
- LearnG
- More

# NumPy user guide

# Section Navigation

- Getting started
- What is NumPy?
- NumPy quickstart
- Installation
- NumPy: the absolute basics for beginners
- Fundamentals and usage
- NumPy fundamentals
- NumPy for MATLAB users
- NumPy tutorials
- NumPy how-tos
- Advanced usage and interoperability
- Using NumPy C-API
- FZPY user guide and reference manual

# Prerequisites

You’ll need to know a bit of Python: For a refresher, see the Python tutorial:

To work the examples, you’ll need matplotlib installed in addition to NumPy:

# Learner profile

This is a quick overview of arrays in NumPy. It demonstrates how n-dimensional (n >= 2) arrays are represented and can be manipulated. In particular, if you don't know how to apply common functions to n-dimensional arrays (without using for-loops) or if you want to understand axis and shape properties for n-dimensional arrays, this article might be of help:

# Learning Objectives
# Scikit-learn library

import   sklearn
import   sklearn.datasets       as  skdata

housing    = skdata.fetch_california_housing()
x  = housing.data
y  = housing.target
feat_names     = housing.feature_names
# Visualizing data

Let’s plot our data using the matplotlib library!

from matplotlib import pyplot as plt
Let’s start with how income varies with price.

income = x[:, 0]  # MedInc is the 1st dimension
fig = plt.figure()

ax = fig.add_subplot(1, 1, 1)  # (row, col, idx)

ax.scatter(income, y)

plt.show(block=True)

Slide credit: Alex Wong
# Visualizing data

Let’s add labels to the axes:

fig    =  plt.figure()                 California Housing Data
ax   =  fig.add_subplot(1,            1,   1)   #  (row,    col,  idx)
ax.scatter(income,  [ 2 y)
fig.suptitle('California                Housing      Data')
ax.set_ylabel('Housing               Price')
ax.set_xlabel('Median              Income')       12
Median IncomeMedlnc
plt.show(block=True)
Slide credit: Alex Wong
# Visualizing data

# Median Income ($10,000s)

Let’s see population vs. price:

fig = plt.figure()
fig.suptitle('California Housing Data')
ax1 = fig.add_subplot(2, 1, 1)  # rows, cols, index
ax1.set_title('Median Income ($10,000s)')
ax1.set_ylabel('Housing Price')
ax1.set_xlabel('Median Income')
ax1.scatter(income, y)

population = x[:, 4]  # 2nd plot
ax2 = fig.add_subplot(2, 1, 2)  # 2 rows
ax2.set_title('Population')
ax2.set_ylabel('Housing Price')
ax2.set_xlabel(feat_names[4])
ax2.scatter(population, y)

plt.show(block=True)

|Median Income|Population|
|---|---|
|5000| |
|10000| |
|15000| |
|20000| |
|25000| |
|30000| |
|35000| |
# Visualizing data

Let’s try overlaying the two sets of features:

fig     =   plt.figure()
fig.suptitle('California                             Housing       Data')
ax    =   fig.add_subplot(1, Price')1,                   1)
ax.set_ylabel('Housing
ax.set_xlabel('Features')
obs = =
ys
clr     = (y, (income,
('blue',  y)        population)
'red')
marker (feat_names[0],
lbl     =     =    ('o',        '^')           feat_names[4])
for     o,    yi,      c,    l, yi, in m       zip(obs,        ys, marker=m)clr,  lbl,  marker):
ax.scatter(o,                         c=c,       label=l,
ax.legend(loc='upper                         right')
plt.show(block=True)
Slide credit: Alex Wong
# Visualizing data

The scales are too different…

# California Housing Data

|Medinc|Population|
|---|---|
|5000|2|
|10000|3|
|15000|4|
|20000|5|
|25000|6|
|30000|7|
|35000|8|

print(np.min(income), np.max(income))

# MedInc: (0.4999, 15.0001)

print(np.min(population), np.max(population))

# Population: (3.0, 35682.0)

# Q: How can we get them on the same scale?
# Tuesday’s learning objectives

- Explore datasets in scikit-learn (sklearn) library
- Plot data with the matplotlib library
- Implement min-max and standard normalization
- Visualize data in 3D
# 1) Min-max normalization

Normalize using min and max values:

𝑧 = max 𝑥 − min(𝑥)

𝑥  − min(𝑥)

def  min_max_norm(x):
return   (x  - np.min(x))     / (np.max(x)    -  np.min(x))

# Let’s apply it to income and population!

income_minmax     =  min_max_norm(income)
populn_minmax     =  min_max_norm(population)

print(np.min(income_minmax),np.max(income_minmax))
print(np.min(populn_minmax),np.max(populn_minmax))
# 1) Min-max normalization

Now let’s overlay the two feature sets again:

California Housing Data

ax.set_ylabel('Housing Price')

ax.set_xlabel('Min-Max Norm Features')

obs = (income_minmax, populn_minmax)

for o, yi, c, l, m in zip(obs, ys, clr, lbl, marker):

ax.scatter(o, yi, c=c, label=l, marker=m)

ax.legend(loc='upper right')

plt.show(block=True)

Slide credit: Alex Wong
# 1) Min-max normalization

Now we can see trends in the data:

- Prices increase as median income increases
- Not a strong relationship between price and population

# Q: Any issues with min-max?

Dividing population by max squishes observations btw. 0 and 0.3, with a few outliers…

# California Housing Data

|Medlnc|Population|
|---|---|
|Q: Is there a way to normalize data so it’s better distributed?|Q: Is there a way to normalize data so it’s better distributed?|

0.0  0.2    0.4     0.6     0.8  10

Slide credit: Alex Wong

# Min-Max Norm Features
# 2) Standard normalization

Results in a mean of 0 and standard deviation of 1:

𝑧 = 𝑥 − μ𝜎

def standard_norm(x):
return (x - np.mean(x)) / (np.std(x))

# Let’s apply it to income and population!

income_std = standard_norm(income)
populn_std = standard_norm(population)

print(np.min(income_std), np.max(income_std))
print(np.min(populn_std), np.max(populn_std))

Slide credit: Alex Wong
# 2) Exercise: Standard normalization

Overlay the two features again. What do you notice?

California Housing Data

Y-axis: Housing Price

X-axis: Standard Norm Features

Observations:

|Income Standard|Population Standard|
|---|---|
|(income_std)|(populn_std)|

For each observation, the following parameters were used:

- o: Observation
- yi: Y-axis value
- c: Color
- l: Label
- m: Marker

Legend location: upper right

Slide credit: Alex Wong
# 2) Standard normalization

# California Housing Data

|MedInc|Population|
|---|---|
|2| |
|[| |
|10| |
|15| |
|20| |
|25| |
|30| |

# Standard Norm Features

- Min-max has a bounded range, but this will squish the data.
- Standard norm is not bounded, but retains info about outliers.

Slide credit: Alex Wong
# Visualizing in 3D

Let’s visualize income and population in 3D:

from   mpl_toolkits.mplot3d        import    Axes3D

fig =   plt.figure()
fig.suptitle('California Housing Data')

ax =   fig.add_subplot(1, 1, 1, projection='3d')
ax.set_zlabel('Housing Price')
ax.set_xlabel('Income')
ax.set_ylabel('Population')
ax.scatter(income_minmax,          populn_minmax, y, c='blue',
marker='o')

plt.show(block=True)

Slide credit: Alex Wong
# Visualizing in 3D

Can now see how the data is distributed together—how both features vary together with respect to housing price.

# California Housing Data

|Population|Income|
|---|---|
|0.0|0.0|
|0.2|0.2|
|0.4|0.4|
|0.6|0.6|
|0.8|0.8|
|1.0|1.0|

Slide credit: Alex Wong
# Plotly

pip install plotly pandas

import plotly.express as px
import pandas as pd

data = pd.DataFrame(x, columns=feat_names)
print(data)

fig = px.scatter_geo(data, lat='Latitude',
lon='Longitude', scope='usa', color='MedInc’)

# Try assigning different features to color!
fig.show()
# Exercise

Explore the UC Irvine Breast Cancer dataset:

import    sklearn.datasets      as   skdata
breast_cancer_data        = skdata.load_breast_cancer()
# Extract the data, feature names, and target

# Pick a couple features to plot against the target!

# Try normalizing the data

Target is binary (1 or 0) for benign or malignant.
# Today’s learning objectives

- Define Machine Learning.
- List three types of Machine Learning algorithms.
- Give examples of supervised learning tasks.
- Name an unsupervised learning technique.
- Explain how reinforcement learning works.
- Describe the learning task with math.
# What is learning?

# How do humans learn?

Observations
Learning
Action
# How do machines learn?

Data (observations)
Learning
Decision (action)
Based on slides by Alex Wong
# Reminder: Machine Learning is…

Machine learning, a branch of artificial intelligence, concerns the construction and study of systems that can learn from data.

WIKIPEDIA

The Free Encyclopedia

Slide credit: David Kauchak
# Machine Learning is…

Machine learning is about predicting the future based on the past.

-- Hal Daume III

# Course

# Machine Learning

Slide credit: David Kauchak
# Machine Learning

“the field of study that gives computers the ability to learn without being explicitly programmed.” -Arthur Samuel (1959)

Based on slide by Eric Eaton

Photos from Wikipedia
# Machine Learning is…

“a computer program is said to learn from experience E with respect to some class of tasks T and performance P, if its performance at tasks in T, as measured by P, improves with experience E.” - Tom Mitchell (1998)

# Based on slide by Eric Eaton

# Tom Mitchell

E. Fredkin University Professor

Machine Learning Department

School of Computer Science

Carnegie Mellon University

Image from Tom Mitchell’s homepage
# Traditional Programming

|Data|Computer|Output|
|---|---|---|
|Program| | |

# Machine Learning

|Data|Computer|Program|
|---|---|---|
|Output| | |

Slide credit: Pedro Domingos
# When do we use Machine Learning?

ML is used when:

- Human expertise does not exist
- Humans cannot explain their expertise
- Models must be customized
- Models are based on huge amounts of data

Learning is not always useful

Slide credit: Eric Eaton

Based on slide by E. Alpaydin
# A classic example of a task that requires machine learning:

It is very hard to say what makes a 2

0 0 0 | ] ( / 1 6 2

3 7 2 4 j 2 7 $ 7 ?

2 6 4 9 4 4 J 5 > G

L 2 7 2 1 `1 1 2 9 3

6 8 & 1 9 4 9 9

Slide credit: Geoffrey Hinton
# Some examples of tasks that are best solved by using a learning algorithm

- Learning patterns
- Predicting passenger survivability on the Titanic
- Recognizing tweets as positive or negative
- Clustering faces by identity
- State-of-the-art applications
- Autonomous cars
- Automatic speech recognition
- Anomalies in credit card transactions
- ChatGPT
- [Your favorite area here]

Slide credit: Jessica Wu
# ML/AI jobs on the rise

1. Chief Growth Officer
2. Government Program Analyst (Data Analysis)
3. Environment Health Safety Manager
4. Director of Revenue Operations
5. Sustainability Analyst (Data Analysis)
6. Advanced Practice Provider
7. VP of Diversity and Inclusion
8. AI Consultant
9. Recruiter
10. AI Engineer
# Today’s learning objectives

- Define Machine Learning.
- List three types of Machine Learning algorithms.
- Give examples of supervised learning tasks.
- Name an unsupervised learning technique.
- Explain how reinforcement learning works.
- Describe the learning task with math.
# Types of Machine Learning

|Supervised Learning|Unsupervised Learning|
|---|---|
|Reinforcement Learning| |

Slide credit: Moses Charikar, Tengyu Ma, Chris Re
# Supervised learning: Housing price

Given: a dataset of 𝑛 samples (𝑥1, 𝑦1, … , (𝑥n, 𝑦n))

Task: if a residence has 𝑥 sq ft, what is its price 𝑦?

15th sample:

|𝑥|𝑦|
|---|---|
|800|?|

Slide credit: Moses Charikar, Tengyu Ma, Chris Re
# More features

Suppose we also know the lot size

# Task:

find a function that maps

|(size, lot size)|→|price|
|---|---|---|
|features/input| |label/output|
|𝑥 ∈ ℝ!| |𝑦 ∈ ℝ|

<svg width="300" height="200">

</svg>

3.5

3.0

3

2.5

2.0

1.5

1.0

0.5

0.0

lot size (103 sq.ft)

2.5 size 1.0 22.0 1.5

𝑥"

6 3.0 living

Slide credit: Moses Charikar, Tengyu Ma, Chris Re
# High-dimensional features

𝑥 ∈ ℝ! for large 𝑑

Ex)

- 𝑥! --- median income
- 𝑥# --- house age
- 𝑥$ --- average rooms

𝑥 = ⋮ ⋮ 𝑦 --- price

⋮

⋮

𝑥%

Slide credit: Moses Charikar, Tengyu Ma, Chris Re
# Regression vs. Classification

# Regression

If 𝑦 ∈ ℝ is a continuous variable

- e.g., price prediction! Lot size (10 sq. ft)

# Classification

The label is a discrete variable

- e.g., the task of predicting the types of residence

|Size (10 sq. ft)|House|Townhouse|
|---|---|---|
|2|8| |
|0.5|1.0|1.5|
|2.0|2.5|3.0|

𝑦 = house or townhouse?

Slide credit: Moses Charikar, Tengyu Ma, Chris Re
# Supervised Learning: Classification

Given: a dataset of 𝑛 samples 𝑥1, 𝑦1, … , (𝑥n, 𝑦n)

Task: given tumor size 𝑥, is it benign or malignant?

# Breast Cancer (Malignant / Benign)

|1 (Malignant)|0 (Benign)|
|---|---|
|Tumor Size|Tumor Size|
|Predict Benign|Predict Malignant|

Based on slide by Eric Eaton

[example originally by Andrew Ng]
# Supervised Learning

𝑥 can be multi-dimensional:

- each dimension corresponds to an attribute

# Attributes

- Clump Thickness
- Uniformity of Cell Size
- Uniformity of Cell Shape
- …

# Tumor Size

Based on slide by Eric Eaton

[example originally by Andrew Ng]
# Supervised learning: Vision

# Image classification:

𝑥 = raw pixels of the image ILSVRC

𝑦 = the main object

|flamingo|cock|ruffed grouse|quail|partridge|
|---|---|---|---|---|
|Egyptian cat|Persian cat|Siamese cat|tabby|lynx|
|dalmatian|keeshond|miniature schnauzer|standard schnauzer|giant schnauzer|

Slide credit: Moses Charikar, Tengyu Ma, Chris Re

ImageNet Large Scale Visual Recognition Challenge. Russakovsky et al.’2015
# Example: Pothole detection

The model can quickly find potholes from miles of road data: cracks, and other weird stuff.

Play (k) with a high rate of accuracy.
# Supervised learning:

# Natural Language Processing (NLP)

# Google Translate Machine translation

|Text|Documents|
|---|---|
|DETECT LANGUAGE|CHINESE|
|ENGLISH|SPANISH|
|CHINESE (SIMPLIFIED)|ENGLISH|
|SPANISH| |

Machine translation is a supervised learning problem.

Jiqifanyi shi yi zhong you jiandu de xuexi wenti

Note: this course only covers the basics of NLP—take 5370 next semester for more detail!

Slide credit: Moses Charikar, Tengyu Ma, Chris Re
# Today’s learning objectives

- Define Machine Learning.
- List three types of Machine Learning algorithms.
- Give examples of supervised learning tasks.
- Name an unsupervised learning technique.
- Explain how reinforcement learning works.
- Describe the learning task with math.
# Unsupervised learning

Dataset contains no labels: 𝑥1, … , 𝑥#

Goal: find hidden structures in the data

- e.g., clustering

|8|townhouse|supervised|
|---|---|---|
|house|8|unsupervised|
|2| |X|
|8| |X*|
|5| |X X x x Xx X|
| | |X|

0.5 1.0 1.5 2.0 2.5 3.0

0.5 1.0 1.5 2.0 2.5 3.0

Slide credit: Moses Charikar, Tengyu Ma, Chris Re
# Clustering

Based on slide by Eric Eaton
# Clustering genes

# Genomics: group individuals by genetic similarity

|Cluster 1|Cluster 7|
|---|---|
|Individuals| |

Slide credit: Eric Eaton

[Source: Daphne Koller]
# Clustering customer segments

# Market segmentation

# Social network analysis

Based on slide by Andrew Ng
# Unsupervised NLP: Word embeddings

# Represent words by vectors

|Word|Vector|Unlabeled dataset|
|---|---|---|
|relation|direction| |
|Rome|Italy|Paris|
|France|Germany| |

# Word2vec [Mikolov et al’13]

# GloVe [Pennington et al’14]

Slide credit: Moses Charikar, Tengyu Ma, Chris Re
# Today’s learning objectives

- Define Machine Learning.
- List three types of Machine Learning algorithms.
- Give examples of supervised learning tasks.
- Name an unsupervised learning technique.
- Explain how reinforcement learning works.
- Describe the learning task with math.
# Reinforcement learning

Collects data interactively

# Goal: maximize the reward

# Environment

|States|State|Actions|Reward|Agent|
|---|---|---|---|---|
|Rewards|Rewards|Rewards|Rewards|Rewards|

Source
# Reinforcement learning

# Backgammon

… WIN!

… LOSE!

Given sequences of moves and whether or not the player won at the end, learn to make good moves

Slide credit: David Kauchak
# Reinforcement learning

During training; the car explores with random actions:
# Brief Peek at Topics

- Supervised learning
- Perceptron
- Decision trees
- K-nearest neighbors
- Linear regression
- Logistic regression
- Support vector machines
- Ensemble methods
- Reinforcement learning
- None: covered in-depth in AI (CMSI 3300)
- Deep learning

# Y2

# 13

# Ya

- Unsupervised learning
- Dimensionality reduction
- Clustering
- Bias and fairness in ML
# Today’s learning objectives

- Define Machine Learning.
- List three types of Machine Learning algorithms.
- Give examples of supervised learning tasks.
- Name an unsupervised learning technique.
- Explain how reinforcement learning works.
- Describe the learning task with math.
# Framing a Learning Problem

# Learning Goals

- List stages of ML pipeline
- Name some key issues in ML
# Defining the learning task

Improve on task T, with respect to performance metric P, based on experience E

# T: Playing checkers

P: Percentage of games won against an arbitrary opponent

E: Playing practice games against itself

# T: Recognizing hand-written words

P: Percentage of words correctly classified

E: Database of human-labeled images of handwritten words

# T: Categorize email messages as spam or legitimate

P: Percentage of email messages correctly classified

E: Database of emails, some with human-given labels

# Q: Which type of ML algorithm does each task use?

Slide credit: Ray Mooney
# Representing examples

# What is an example?

# How is it represented?

|examples|features|
|---|---|
|red, round, leaf, 3oz, …|feat1, feat2, feat3 weight, …|
|green, round, no leaf, 4oz, …|color, shape, leaf, feat4,…|
|yellow, curved, no leaf, 4oz, …| |
|green, curved, no leaf, 5oz, …| |

How our algorithms actually “view” the data

Features are the questions we can ask about the examples

Based on slide by David Kauchak
# Learning system

|examples’ features|label|
|---|---|
|red, round, leaf, 3oz, …|apple|
|green, round, no leaf, 4oz, …|apple|
|yellow, curved, no leaf, 4oz, …|banana|
|green, curved, no leaf, 5oz, …|banana|

During learning/training/induction, learn a model of what distinguishes apples and bananas based on the features.

|examples’ features|model/|classifier|apple or banana?|Why?|
|---|---|---|---|---|
|red, round, no leaf, 4oz, …|model/|classifier|apple| |

The model can then classify a new example based on the features.

Based on slide by David Kauchak
# Learning system

Learning is generalizing from training data.

# What does this assume about train and test sets?

|Training data|Test set|Training data|
|---|---|---|
|Not always the case, but we’ll often assume it is!|Not always the case, but we’ll often assume it is!|Not always the case, but we’ll often assume it is!|

Based on slide by David Kauchak
# More technically…

We will use the probabilistic model of learning.

There is some (unknown) probability distribution over example/label pairs called the data generating distribution.

Both the training data and the test set are generated based on this distribution.

- – we call this i.i.d. (independent and identically distributed)

Based on slide by David Kauchak
# ML as function approximation

# Problem Setting:

- Set of possible instances 𝑋
- Set of possible labels 𝑌
- Unknown target function f : 𝑋 → 𝑌
- Set of function hypotheses 𝐻 = {ℎ | ℎ : 𝑋 → 𝑌}

Input: Training examples of unknown target function 𝑓(lu) (superscript denotes example number)

Output: Hypothesis ℎ → 𝐻 that best approximates 𝑓

Slide credit: Eric Eaton

Based on slide by Tom Mitchell
# The learning problem

|Target Function|Observations|
|---|---|
|f: x - y|D (Dataset)|
|Learning Algorithm|Final Hypothesis|
|g: x = V|9 ~ f|

Slide credit: Alex Wong
# Stages of Machine Learning

Given: labeled training data

# Train model:

𝑋, 𝑌

model ß learner.train(𝑋, 𝑌)

learner

# Apply model to new data:

𝑥  model

Given: new unlabeled instance 𝑥

ß model.predict(𝑥)

Based on slide by Eric Eaton
# Example: Regression

Consider regression:

- f : 𝑋 → 𝑌
- 𝑥, 𝑦 ∈ ℝ

# Question 1:

How should we pick the hypothesis space 𝐻?

# Question 2:

How do we find the best ℎ in this space?

Based on slide by David Sontag

Images from Bishop [PRML]
# Hypothesis space: Degree-M polynomials

| |M = 0|M = 1|
|---|---|---|
|Infinitely many hypotheses|y|y|
|M < 9 inconsistent with dataset, but| | |
| |M = 3|M = 9|
| |y|y|

# Which one is best?

y(€,w) = W0 + W1x + W2x2 + ... + WMxM

Based on slide by David Sontag

Images from Bishop [PRML]
# Hypothesis space: Degree-M polynomials

y
y
y
y
We measure error using a loss function.

# Learning Curve

|Training|Test|
|---|---|
|example of|overfitting|

For regression, common choice is squared loss:

|JL @)|4 0.5|
|---|---|
|4 0.5|00 0|
|00 0| |

Empirical loss of function ℎ applied to training data:

|12(_ S|1|
|---|---|
|IL J=|E I|

measure of model complexity

Based on slide by David Sontag

Images from Bishop [PRML]
# Key issues in Machine Learning

# Representation:

How do we choose a hypothesis space?

# Optimization:

How do we find the best hypothesis?

# Evaluation:

How can we gauge the accuracy of a hypothesis on unseen testing data?

Based on slides by Eric Eaton and by David Sontag
# Machine Learning in practice

# Understand domain, prior knowledge, and goals

- Data integration, selection, cleaning, pre-processing, etc.

# Loop

- Learn models
- Interpret results
- Consolidate and deploy discovered knowledge

Slide credit: Eric Eaton

Based on a slide by Pedro Domingos
# Today’s learning objectives

- Define Machine Learning.
- List three types of Machine Learning algorithms.
- Give examples of supervised learning tasks.
- Name an unsupervised learning technique.
- Explain how reinforcement learning works.
- Describe the learning task with math.
# Exercise

Pick 2 applications and frame them as a learning problem with input (features) X and predicted output y.

- Web search
- Finance
- Healthcare
- E-commerce
- Natural language processing
- Robotics
- Social networks
- [Your favorite area]

Based on slide by Pedro Domingos
# Quote of the day

Attitude is a little thing that makes a big difference.

- W I N S T O N C H U R C H I L L

Phoebe Rusack, 2023, weareteachers.com
# Socrative: Optional feedback

http://socrative.com

Go to student login (it’s anonymous!)

# socrative

# Student Login

Room Name

NYL SDRJJ

JOIN

# socrative

# Meet Socrative

Your classroom app for fun effective engagement and on-the-fly assessments; GET ACCOUNT

83

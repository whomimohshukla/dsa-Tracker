require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa_tracker';

const aiTopics = [
  // ════════════════════════════════════════════════
  // PHASE 1: FOUNDATIONS
  // ════════════════════════════════════════════════
  {
    topicId: 'ai-python',
    topicName: 'Python for AI/ML',
    topicEmoji: '🐍',
    phase: 'Phase 1: Foundations',
    phaseIndex: 1,
    tag: 'core',
    items: [
      {
        title: 'Python basics — variables, loops, functions, OOP',
        difficulty: 'Beginner',
        pattern: 'Core Python',
        hint: 'Master list comprehensions, lambda, *args/**kwargs, decorators and classes before doing any ML.',
        approach: 'Practice: write 5 functions using list comprehensions, build a simple class with __init__, __repr__. Focus on understanding pass-by-reference vs pass-by-value for lists.',
        proTip: 'Google Colab is free and has GPU — use it from day 1.',
        tags: ['python', 'basics', 'oop'],
        youtubeResources: [
          { title: 'Python Full Course for Beginners', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', channel: 'Programming with Mosh', duration: '6h' },
          { title: 'Python for ML — Complete Bootcamp', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', channel: 'freeCodeCamp', duration: '4.5h' },
          { title: 'Python OOP Tutorial', url: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM', channel: 'Corey Schafer', duration: '1h' },
        ],
      },
      {
        title: 'NumPy — arrays, vectorization, broadcasting',
        difficulty: 'Beginner',
        pattern: 'NumPy',
        hint: 'NumPy is the backbone of all ML math. Master ndarray, reshape, broadcasting, and fancy indexing.',
        approach: 'Create arrays of various shapes. Practice: matrix multiply, compute dot product, apply boolean masks, reshape (3,4) to (4,3), use np.where, np.argmax.',
        proTip: 'Vectorized operations are 100x faster than Python loops. Never use for-loops on arrays in production.',
        tags: ['numpy', 'arrays', 'vectorization'],
        youtubeResources: [
          { title: 'NumPy Full Tutorial', url: 'https://www.youtube.com/watch?v=QUT1VHiLmmI', channel: 'freeCodeCamp', duration: '1h' },
          { title: 'NumPy for ML — CampusX', url: 'https://www.youtube.com/watch?v=Rbh1rieb3zc', channel: 'CampusX', duration: '1.5h' },
          { title: 'Complete NumPy Tutorial', url: 'https://www.youtube.com/watch?v=lLRBYKwP8GQ', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'Pandas — DataFrames, groupby, merging, data wrangling',
        difficulty: 'Beginner',
        pattern: 'Pandas',
        hint: 'Pandas is your data manipulation Swiss Army knife. Master read_csv, loc/iloc, groupby, merge, apply, fillna.',
        approach: 'Download the Titanic dataset from Kaggle. Apply groupby, handle missing values, merge with another DataFrame, compute value_counts, plot distributions.',
        proTip: 'Use .copy() when slicing DataFrames to avoid SettingWithCopyWarning — a very common bug.',
        tags: ['pandas', 'dataframe', 'data-wrangling'],
        youtubeResources: [
          { title: 'Pandas Complete Tutorial — CampusX', url: 'https://www.youtube.com/watch?v=RhEjmHeDNoA', channel: 'CampusX', duration: '2h' },
          { title: 'Pandas Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=vmEHCJofslg', channel: 'Corey Schafer', duration: '1h' },
          { title: 'Pandas in 1 Hour — Krish Naik', url: 'https://www.youtube.com/watch?v=ZyhVh-qRZPA', channel: 'Krish Naik', duration: '1h' },
        ],
      },
      {
        title: 'Matplotlib & Seaborn — data visualization',
        difficulty: 'Beginner',
        pattern: 'Visualization',
        hint: 'Visualization is how you understand your data BEFORE modeling. Master line, bar, scatter, heatmap, pairplot.',
        approach: 'Load the Iris dataset. Plot: scatter matrix with seaborn pairplot, correlation heatmap, class distribution bar chart, feature boxplots grouped by label.',
        proTip: 'Seaborn\'s sns.pairplot() in one line gives you more insight than an hour of manual plotting.',
        tags: ['matplotlib', 'seaborn', 'visualization', 'eda'],
        youtubeResources: [
          { title: 'Matplotlib & Seaborn Tutorial — CampusX', url: 'https://www.youtube.com/watch?v=7SSFnYnJ5uw', channel: 'CampusX', duration: '1.5h' },
          { title: 'Data Visualization with Python', url: 'https://www.youtube.com/watch?v=a9UrKTVEeZA', channel: 'Krish Naik', duration: '2h' },
          { title: 'Matplotlib Full Course', url: 'https://www.youtube.com/watch?v=3Xc3CA655Y4', channel: 'Corey Schafer', duration: '1h' },
        ],
      },
      {
        title: 'Jupyter Notebooks & Google Colab — dev environment',
        difficulty: 'Beginner',
        pattern: 'Tools',
        hint: 'Learn keyboard shortcuts: Shift+Enter (run cell), A/B (add cell above/below), M (markdown), Y (code).',
        approach: 'Set up Colab: mount Google Drive, install packages with pip, use GPU runtime, share notebooks.',
        proTip: 'Use Colab Pro (free tier) for GPU. For local dev, VS Code with Jupyter extension is superior.',
        tags: ['jupyter', 'colab', 'tools'],
        youtubeResources: [
          { title: 'Jupyter Notebook Complete Tutorial', url: 'https://www.youtube.com/watch?v=HW29067qVWk', channel: 'Corey Schafer', duration: '30min' },
          { title: 'Google Colab Tips & Tricks', url: 'https://www.youtube.com/watch?v=inN8seMm7UI', channel: 'sentdex', duration: '20min' },
        ],
      },
    ],
  },
  {
    topicId: 'ai-math',
    topicName: 'Mathematics for ML',
    topicEmoji: '📐',
    phase: 'Phase 1: Foundations',
    phaseIndex: 1,
    tag: 'core',
    items: [
      {
        title: 'Linear Algebra — vectors, matrices, dot products, eigenvalues',
        difficulty: 'Intermediate',
        pattern: 'Linear Algebra',
        hint: 'Every neural network layer is a matrix multiplication. You MUST understand this deeply.',
        approach: 'Study: matrix multiply manually, compute eigenvalues of 2x2 matrix, understand what SVD does geometrically. Use 3Blue1Brown\'s "Essence of Linear Algebra" series.',
        proTip: 'SVD is used in recommendation systems, PCA, and image compression. Understanding it separates good from great ML engineers.',
        tags: ['linear-algebra', 'matrices', 'vectors', 'math'],
        youtubeResources: [
          { title: 'Essence of Linear Algebra (3Blue1Brown)', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', channel: '3Blue1Brown', duration: '3h series' },
          { title: 'Linear Algebra for ML — CampusX', url: 'https://www.youtube.com/watch?v=e50Bj7jn9IQ', channel: 'CampusX', duration: '2h' },
          { title: 'MIT 18.06 Linear Algebra Lectures', url: 'https://www.youtube.com/playlist?list=PLE7DDD91010BC51F8', channel: 'MIT OCW', duration: 'Full course' },
        ],
      },
      {
        title: 'Calculus — derivatives, chain rule, partial derivatives, gradients',
        difficulty: 'Intermediate',
        pattern: 'Calculus',
        hint: 'Backpropagation IS the chain rule applied repeatedly. Understanding this is the key to understanding deep learning.',
        approach: 'Derive the gradient descent update rule from scratch. Compute partial derivatives of a 2-variable loss function. Understand what a Jacobian and Hessian are.',
        proTip: '3Blue1Brown\'s "Essence of Calculus" is the clearest resource ever made. Watch it before any deep learning.',
        tags: ['calculus', 'derivatives', 'gradients', 'math'],
        youtubeResources: [
          { title: 'Essence of Calculus (3Blue1Brown)', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', channel: '3Blue1Brown', duration: '2h series' },
          { title: 'Calculus for ML — Krish Naik', url: 'https://www.youtube.com/watch?v=LWfgCr5qlkA', channel: 'Krish Naik', duration: '1.5h' },
          { title: 'Backpropagation Calculus — 3Blue1Brown', url: 'https://www.youtube.com/watch?v=tIeHLnjs5U8', channel: '3Blue1Brown', duration: '10min' },
        ],
      },
      {
        title: 'Probability & Statistics — distributions, Bayes theorem, hypothesis testing',
        difficulty: 'Intermediate',
        pattern: 'Statistics',
        hint: 'Normal distribution, conditional probability, expectation, variance, p-values — these underpin every ML algorithm.',
        approach: 'Implement Bayes theorem for spam detection. Compute mean, variance, covariance of a dataset. Simulate a t-test.',
        proTip: 'StatQuest with Josh Starmer is the best stats channel on YouTube — each video is gold.',
        tags: ['probability', 'statistics', 'bayes', 'distributions', 'math'],
        youtubeResources: [
          { title: 'Statistics Fundamentals — StatQuest', url: 'https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9', channel: 'StatQuest', duration: 'Series' },
          { title: 'Probability & Statistics for ML — CampusX', url: 'https://www.youtube.com/watch?v=sbbYntt5CJk', channel: 'CampusX', duration: '3h' },
          { title: 'Probability for DS — Krish Naik', url: 'https://www.youtube.com/watch?v=YXLVjCKVP7U', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'Gradient Descent — theory, variants, intuition',
        difficulty: 'Intermediate',
        pattern: 'Optimization',
        hint: 'Gradient descent is how ALL neural networks learn. BGD vs SGD vs Mini-batch — know the trade-offs.',
        approach: 'Code gradient descent from scratch in NumPy to minimize a simple loss: L = (x-3)^2. Implement both BGD and SGD. Visualize the loss curve.',
        proTip: 'Visualizing the loss landscape as a 3D surface and watching gradient descent navigate it is the best intuition builder.',
        tags: ['gradient-descent', 'optimization', 'math'],
        youtubeResources: [
          { title: 'Gradient Descent, Step-by-Step — StatQuest', url: 'https://www.youtube.com/watch?v=sDv4f4s2SB8', channel: 'StatQuest', duration: '24min' },
          { title: 'Gradient Descent — 3Blue1Brown', url: 'https://www.youtube.com/watch?v=IHZwWFHWa-w', channel: '3Blue1Brown', duration: '21min' },
          { title: 'All Gradient Descent Variants — CampusX', url: 'https://www.youtube.com/watch?v=Fn7dLM5tiMU', channel: 'CampusX', duration: '1.5h' },
        ],
      },
    ],
  },
  {
    topicId: 'ai-data',
    topicName: 'Data Skills & EDA',
    topicEmoji: '🗄️',
    phase: 'Phase 1: Foundations',
    phaseIndex: 1,
    tag: 'core',
    items: [
      {
        title: 'Exploratory Data Analysis (EDA) — complete workflow',
        difficulty: 'Beginner',
        pattern: 'EDA',
        hint: 'EDA = understand your data before modeling. Check distributions, missing values, correlations, outliers.',
        approach: 'Use the Titanic or House Prices dataset. Pipeline: shape → dtypes → null check → describe() → correlation heatmap → target distribution → feature boxplots.',
        proTip: 'Use ydata-profiling (formerly pandas-profiling): one line generates a full HTML EDA report.',
        tags: ['eda', 'data-analysis', 'pandas'],
        youtubeResources: [
          { title: 'Complete EDA Tutorial — CampusX', url: 'https://www.youtube.com/watch?v=Xfr7XGWX-Dc', channel: 'CampusX', duration: '2h' },
          { title: 'EDA with Python — Krish Naik', url: 'https://www.youtube.com/watch?v=ioN1jcWxbv8', channel: 'Krish Naik', duration: '1.5h' },
        ],
      },
      {
        title: 'Feature Engineering — encoding, scaling, normalization, feature creation',
        difficulty: 'Intermediate',
        pattern: 'Feature Engineering',
        hint: 'Feature engineering often matters MORE than model choice. Label encoding vs One-Hot encoding, StandardScaler vs MinMaxScaler.',
        approach: 'On a dataset: apply OHE to categorical columns, standardize numerical columns, create interaction features, handle date columns (extract year, month, dayofweek).',
        proTip: 'Tree-based models (XGBoost, RF) don\'t need scaling. Linear models and neural nets DO need scaling.',
        tags: ['feature-engineering', 'encoding', 'scaling'],
        youtubeResources: [
          { title: 'Feature Engineering — CampusX Full Series', url: 'https://www.youtube.com/watch?v=6WDFfaYtN6s', channel: 'CampusX', duration: 'Series' },
          { title: 'Feature Engineering — Krish Naik', url: 'https://www.youtube.com/watch?v=6LmVFSEr5C8', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'Data Cleaning — missing values, outliers, duplicates',
        difficulty: 'Beginner',
        pattern: 'Data Cleaning',
        hint: 'Real data is ALWAYS messy. Strategies: drop, impute with mean/median/mode, use iterative imputer, flag missing as a feature.',
        approach: 'Load a messy dataset. Handle: NaN with SimpleImputer, outliers with IQR method, duplicates with drop_duplicates, inconsistent strings with str.strip().str.lower().',
        proTip: 'Always check if missing data is MCAR, MAR, or MNAR — this determines your imputation strategy.',
        tags: ['data-cleaning', 'missing-values', 'outliers'],
        youtubeResources: [
          { title: 'Data Cleaning with Pandas — CampusX', url: 'https://www.youtube.com/watch?v=oGfCFSmNajQ', channel: 'CampusX', duration: '1h' },
          { title: 'Handling Missing Data — Krish Naik', url: 'https://www.youtube.com/watch?v=fCWaw2r97Yw', channel: 'Krish Naik', duration: '1h' },
        ],
      },
      {
        title: 'SQL for Data Science — joins, aggregations, window functions',
        difficulty: 'Beginner',
        pattern: 'SQL',
        hint: 'SQL is mandatory for data jobs. Master: SELECT, WHERE, GROUP BY, HAVING, JOINs, subqueries, and window functions.',
        approach: 'Practice on LeetCode SQL section or Mode Analytics. Focus on: RANK() OVER (PARTITION BY), LAG/LEAD, CASE WHEN, CTEs.',
        proTip: 'Window functions (RANK, LEAD, LAG, SUM OVER) are what separate junior from senior data engineers.',
        tags: ['sql', 'database', 'data-engineering'],
        youtubeResources: [
          { title: 'SQL Tutorial for Data Science — Alex The Analyst', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', channel: 'Alex The Analyst', duration: '3h' },
          { title: 'SQL for Data Analysis — CampusX', url: 'https://www.youtube.com/watch?v=M6Fe_A3nQcQ', channel: 'CampusX', duration: '2h' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════
  // PHASE 2: CORE MACHINE LEARNING
  // ════════════════════════════════════════════════
  {
    topicId: 'ai-supervised',
    topicName: 'Supervised Learning',
    topicEmoji: '🎯',
    phase: 'Phase 2: Core Machine Learning',
    phaseIndex: 2,
    tag: 'ml',
    items: [
      {
        title: 'Linear Regression — theory, cost function, regularization',
        difficulty: 'Beginner',
        pattern: 'Regression',
        hint: 'Understand the Normal Equation AND gradient descent derivation. Ridge (L2) vs Lasso (L1) regularization differences are exam favorites.',
        approach: 'Implement linear regression from scratch using NumPy. Then use sklearn LinearRegression. Compare MSE with and without regularization on a housing dataset.',
        proTip: 'Lasso (L1) does feature selection by pushing weights to exactly 0. Ridge (L2) shrinks but never zeroes.',
        tags: ['linear-regression', 'regression', 'supervised'],
        youtubeResources: [
          { title: 'Linear Regression — StatQuest', url: 'https://www.youtube.com/watch?v=nk2CQITm_eo', channel: 'StatQuest', duration: '30min' },
          { title: 'Linear Regression from Scratch — CampusX', url: 'https://www.youtube.com/watch?v=UZPfbG0jNec', channel: 'CampusX', duration: '2h' },
          { title: 'Ridge and Lasso Regression — Krish Naik', url: 'https://www.youtube.com/watch?v=Xm2C_gTAl8c', channel: 'Krish Naik', duration: '1h' },
        ],
      },
      {
        title: 'Logistic Regression — sigmoid, log loss, binary & multiclass',
        difficulty: 'Beginner',
        pattern: 'Classification',
        hint: 'Logistic regression outputs a PROBABILITY using the sigmoid function. Cross-entropy loss, not MSE.',
        approach: 'Build logistic regression from scratch on Breast Cancer dataset. Implement sigmoid, binary cross-entropy loss, compute ROC curve and AUC score.',
        proTip: 'For multiclass: use softmax (not sigmoid) — this is the output layer of every classification neural network.',
        tags: ['logistic-regression', 'classification', 'sigmoid', 'supervised'],
        youtubeResources: [
          { title: 'Logistic Regression — StatQuest', url: 'https://www.youtube.com/watch?v=yIYKR4sgzI8', channel: 'StatQuest', duration: '20min' },
          { title: 'Logistic Regression from Scratch — CampusX', url: 'https://www.youtube.com/watch?v=XNXzVfItWGY', channel: 'CampusX', duration: '2h' },
          { title: 'Logistic Regression — Krish Naik', url: 'https://www.youtube.com/watch?v=L_xBe7MbPwk', channel: 'Krish Naik', duration: '1h' },
        ],
      },
      {
        title: 'Decision Trees & Random Forests — Gini, entropy, bagging',
        difficulty: 'Intermediate',
        pattern: 'Tree Methods',
        hint: 'Decision trees split on the feature that reduces impurity most. Random Forest = many trees + random feature subsets.',
        approach: 'Visualize a decision tree with sklearn plot_tree. Compare RF vs single DT on the same dataset. Check feature_importances_ to understand what drives predictions.',
        proTip: 'Random Forests are one of the most practical, robust algorithms. Use n_jobs=-1 to parallelize training.',
        tags: ['decision-trees', 'random-forest', 'ensemble', 'supervised'],
        youtubeResources: [
          { title: 'Decision Trees — StatQuest', url: 'https://www.youtube.com/watch?v=_L39rN6gz7Y', channel: 'StatQuest', duration: '22min' },
          { title: 'Random Forest — CampusX', url: 'https://www.youtube.com/watch?v=eM4uJ6XGnSM', channel: 'CampusX', duration: '2h' },
          { title: 'Random Forest — Krish Naik', url: 'https://www.youtube.com/watch?v=nxFG5xdpDto', channel: 'Krish Naik', duration: '1h' },
        ],
      },
      {
        title: 'Gradient Boosting — XGBoost, LightGBM, CatBoost',
        difficulty: 'Advanced',
        pattern: 'Boosting',
        hint: 'Gradient boosting builds trees sequentially, each correcting the errors of the previous. XGBoost wins Kaggle competitions.',
        approach: 'Train XGBoost on the House Prices dataset. Tune: n_estimators, learning_rate, max_depth, subsample. Use early_stopping_rounds. Compare with LightGBM speed.',
        proTip: 'LightGBM is 10x faster than XGBoost on large datasets. CatBoost handles categorical features natively.',
        tags: ['xgboost', 'lightgbm', 'catboost', 'boosting', 'ensemble', 'supervised'],
        youtubeResources: [
          { title: 'XGBoost — StatQuest', url: 'https://www.youtube.com/watch?v=OtD8wVaFm6E', channel: 'StatQuest', duration: '25min' },
          { title: 'XGBoost & LightGBM — CampusX', url: 'https://www.youtube.com/watch?v=UZYTB-ceTEU', channel: 'CampusX', duration: '3h' },
          { title: 'XGBoost Tutorial — Krish Naik', url: 'https://www.youtube.com/watch?v=8b1JEDvenQU', channel: 'Krish Naik', duration: '1h' },
        ],
      },
      {
        title: 'Support Vector Machines (SVM) — kernel trick, margin, hyperplane',
        difficulty: 'Intermediate',
        pattern: 'SVM',
        hint: 'SVM finds the hyperplane that maximizes the margin between classes. The kernel trick maps data to higher dimensions.',
        approach: 'Apply SVM with RBF kernel on a non-linearly separable dataset. Visualize decision boundary. Tune C (margin) and gamma (kernel width) with GridSearchCV.',
        proTip: 'SVMs work very well for text classification with TF-IDF features (high-dimensional, sparse data).',
        tags: ['svm', 'kernel', 'classification', 'supervised'],
        youtubeResources: [
          { title: 'Support Vector Machines — StatQuest', url: 'https://www.youtube.com/watch?v=efR1C6CvhmE', channel: 'StatQuest', duration: '20min' },
          { title: 'SVM Complete Tutorial — CampusX', url: 'https://www.youtube.com/watch?v=ugTxMLjLS8M', channel: 'CampusX', duration: '2h' },
          { title: 'SVM with Python — Krish Naik', url: 'https://www.youtube.com/watch?v=Y6RRHw9uN9o', channel: 'Krish Naik', duration: '1h' },
        ],
      },
      {
        title: 'Naive Bayes & k-Nearest Neighbors (KNN)',
        difficulty: 'Beginner',
        pattern: 'Probabilistic & Instance-based',
        hint: 'Naive Bayes assumes feature independence (naive but powerful for NLP). KNN is non-parametric — stores all training data.',
        approach: 'Build a spam classifier with MultinomialNB on email text data. For KNN, implement from scratch using Euclidean distance. Experiment with k values.',
        proTip: 'KNN performance degrades in high dimensions (curse of dimensionality). Apply PCA first for high-dim data.',
        tags: ['naive-bayes', 'knn', 'classification', 'supervised'],
        youtubeResources: [
          { title: 'Naive Bayes — StatQuest', url: 'https://www.youtube.com/watch?v=O2L2Uv9pdDA', channel: 'StatQuest', duration: '15min' },
          { title: 'KNN Algorithm — CampusX', url: 'https://www.youtube.com/watch?v=4HKqjENq9OU', channel: 'CampusX', duration: '1.5h' },
          { title: 'Naive Bayes — Krish Naik', url: 'https://www.youtube.com/watch?v=vz_xuxYS2PM', channel: 'Krish Naik', duration: '1h' },
        ],
      },
    ],
  },
  {
    topicId: 'ai-unsupervised',
    topicName: 'Unsupervised Learning',
    topicEmoji: '🔍',
    phase: 'Phase 2: Core Machine Learning',
    phaseIndex: 2,
    tag: 'ml',
    items: [
      {
        title: 'K-Means Clustering — centroids, inertia, elbow method',
        difficulty: 'Intermediate',
        pattern: 'Clustering',
        hint: 'K-Means iterates: assign each point to nearest centroid, recompute centroids. Use elbow method to find optimal k.',
        approach: 'Cluster customer data by RFM (Recency, Frequency, Monetary). Use elbow method. Visualize 2D PCA projection with cluster colors. Interpret each cluster.',
        proTip: 'K-Means is sensitive to initialization. Use k-means++ (sklearn default) for better results.',
        tags: ['k-means', 'clustering', 'unsupervised'],
        youtubeResources: [
          { title: 'K-Means Clustering — StatQuest', url: 'https://www.youtube.com/watch?v=4b5d3muPQmA', channel: 'StatQuest', duration: '10min' },
          { title: 'K-Means — CampusX', url: 'https://www.youtube.com/watch?v=5shTLzwouws', channel: 'CampusX', duration: '1.5h' },
        ],
      },
      {
        title: 'PCA — dimensionality reduction, explained variance',
        difficulty: 'Intermediate',
        pattern: 'Dimensionality Reduction',
        hint: 'PCA finds the directions of maximum variance. Apply BEFORE training on high-dimensional data to reduce overfitting and speed up training.',
        approach: 'Apply PCA to MNIST digit images. Reduce 784 → 50 dims. Check cumulative explained variance. Reconstruct images from components to build intuition.',
        proTip: 'Choose n_components such that cumulative explained_variance_ratio_ ≥ 0.95.',
        tags: ['pca', 'dimensionality-reduction', 'unsupervised'],
        youtubeResources: [
          { title: 'PCA Step-by-Step — StatQuest', url: 'https://www.youtube.com/watch?v=FgakZw6K1QQ', channel: 'StatQuest', duration: '22min' },
          { title: 'PCA — CampusX', url: 'https://www.youtube.com/watch?v=ToGuhynu-No', channel: 'CampusX', duration: '2h' },
          { title: 'PCA Tutorial — Krish Naik', url: 'https://www.youtube.com/watch?v=Rsl0KBxpvus', channel: 'Krish Naik', duration: '1h' },
        ],
      },
      {
        title: 'DBSCAN, t-SNE, and UMAP — advanced clustering & visualization',
        difficulty: 'Advanced',
        pattern: 'Advanced Clustering',
        hint: 'DBSCAN finds arbitrarily-shaped clusters and handles noise. t-SNE and UMAP reduce high-dim data for visualization only.',
        approach: 'Run DBSCAN on geospatial data (lat/lon) to find city clusters. Use t-SNE on MNIST embeddings. Compare t-SNE vs UMAP visualization quality.',
        proTip: 'UMAP is much faster than t-SNE and preserves global structure better. Use UMAP for large datasets.',
        tags: ['dbscan', 'tsne', 'umap', 'clustering', 'unsupervised'],
        youtubeResources: [
          { title: 'DBSCAN Clustering — StatQuest', url: 'https://www.youtube.com/watch?v=RDZUdRSDOok', channel: 'StatQuest', duration: '18min' },
          { title: 't-SNE and UMAP — CampusX', url: 'https://www.youtube.com/watch?v=NEaUSP4YerM', channel: 'CampusX', duration: '1h' },
        ],
      },
    ],
  },
  {
    topicId: 'ai-evaluation',
    topicName: 'Model Evaluation & Tuning',
    topicEmoji: '📊',
    phase: 'Phase 2: Core Machine Learning',
    phaseIndex: 2,
    tag: 'ml',
    items: [
      {
        title: 'Evaluation Metrics — Precision, Recall, F1, AUC-ROC, RMSE',
        difficulty: 'Intermediate',
        pattern: 'Evaluation',
        hint: 'Accuracy is MISLEADING for imbalanced data. Use F1 score or AUC-ROC. For regression: MAE, RMSE, R2.',
        approach: 'Build a fraud detection classifier. Compute confusion matrix, precision, recall, F1. Plot ROC curve. Vary the classification threshold and observe the trade-off.',
        proTip: 'For imbalanced classes (e.g. fraud 1%, normal 99%), use class_weight="balanced" in sklearn.',
        tags: ['metrics', 'evaluation', 'f1', 'auc', 'roc'],
        youtubeResources: [
          { title: 'ROC and AUC — StatQuest', url: 'https://www.youtube.com/watch?v=4jRBRDbJemM', channel: 'StatQuest', duration: '16min' },
          { title: 'All ML Metrics — CampusX', url: 'https://www.youtube.com/watch?v=ccqwQK7FP20', channel: 'CampusX', duration: '2h' },
          { title: 'Confusion Matrix & Metrics — Krish Naik', url: 'https://www.youtube.com/watch?v=dGVPNDMKXRM', channel: 'Krish Naik', duration: '1h' },
        ],
      },
      {
        title: 'Cross-Validation — k-fold, stratified k-fold, LOOCV',
        difficulty: 'Intermediate',
        pattern: 'Validation',
        hint: 'Cross-validation gives a reliable estimate of generalization. Always use stratified k-fold for classification.',
        approach: 'Compare 5-fold vs 10-fold CV on a small dataset. Check variance of scores. Use cross_val_score and cross_validate in sklearn.',
        proTip: 'For time series data, NEVER use random k-fold — use TimeSeriesSplit to prevent data leakage.',
        tags: ['cross-validation', 'k-fold', 'evaluation'],
        youtubeResources: [
          { title: 'Cross Validation — StatQuest', url: 'https://www.youtube.com/watch?v=fSytzGwwBVw', channel: 'StatQuest', duration: '6min' },
          { title: 'Cross Validation — CampusX', url: 'https://www.youtube.com/watch?v=gJo0uNL-5Qw', channel: 'CampusX', duration: '1h' },
        ],
      },
      {
        title: 'Hyperparameter Tuning — GridSearchCV, RandomizedSearch, Optuna',
        difficulty: 'Intermediate',
        pattern: 'Hyperparameter Optimization',
        hint: 'Never tune hyperparameters on test set. Use nested cross-validation. Optuna (Bayesian) is much more efficient than grid search.',
        approach: 'Tune XGBoost with Optuna: define an objective function, create a study, run 100 trials. Compare to GridSearchCV results and time taken.',
        proTip: 'Optuna + pruning stops unpromising trials early. Use it for any model with >3 hyperparameters.',
        tags: ['hyperparameter-tuning', 'optuna', 'gridsearchcv'],
        youtubeResources: [
          { title: 'Hyperparameter Tuning with Optuna', url: 'https://www.youtube.com/watch?v=P6NwZVl8ttc', channel: 'CampusX', duration: '1.5h' },
          { title: 'Hyperparameter Tuning — Krish Naik', url: 'https://www.youtube.com/watch?v=jUxhUgkKAjE', channel: 'Krish Naik', duration: '1h' },
        ],
      },
      {
        title: 'Scikit-learn Pipelines — end-to-end ML workflow',
        difficulty: 'Intermediate',
        pattern: 'ML Pipelines',
        hint: 'Pipelines chain preprocessing + model into a single object — preventing data leakage and making deployment easy.',
        approach: 'Build: Pipeline([("scaler", StandardScaler()), ("pca", PCA(50)), ("clf", XGBoost())]). Use ColumnTransformer for mixed numeric/categorical data. Save with joblib.',
        proTip: 'ColumnTransformer + Pipeline is the production standard. Anything else risks data leakage.',
        tags: ['pipelines', 'sklearn', 'production', 'ml'],
        youtubeResources: [
          { title: 'Sklearn Pipelines — CampusX', url: 'https://www.youtube.com/watch?v=w3yZIhKq_fc', channel: 'CampusX', duration: '2h' },
          { title: 'ML Pipelines — Krish Naik', url: 'https://www.youtube.com/watch?v=lS_AUxsL3Mg', channel: 'Krish Naik', duration: '1h' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════
  // PHASE 3: DEEP LEARNING
  // ════════════════════════════════════════════════
  {
    topicId: 'ai-neural-nets',
    topicName: 'Neural Network Fundamentals',
    topicEmoji: '🧠',
    phase: 'Phase 3: Deep Learning',
    phaseIndex: 3,
    tag: 'dl',
    items: [
      {
        title: 'Perceptrons, activations — ReLU, Sigmoid, Tanh, GELU',
        difficulty: 'Intermediate',
        pattern: 'Neural Networks',
        hint: 'ReLU solves vanishing gradient but causes dying ReLU. GELU is used in Transformers (BERT, GPT). Understand each activation\'s derivatives.',
        approach: 'Build a single neuron from scratch. Plot all activation functions and their derivatives. Show why ReLU wins over sigmoid for hidden layers.',
        proTip: 'GELU ≈ x * Φ(x) (Gaussian CDF). It\'s smoother than ReLU and used in all modern LLMs.',
        tags: ['perceptron', 'activation', 'relu', 'deep-learning'],
        youtubeResources: [
          { title: 'Neural Networks — 3Blue1Brown Series', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi', channel: '3Blue1Brown', duration: '1.5h series' },
          { title: 'Activation Functions — CampusX', url: 'https://www.youtube.com/watch?v=Nh7p_oMgBx8', channel: 'CampusX', duration: '1h' },
          { title: 'Deep Learning Basics — Krish Naik', url: 'https://www.youtube.com/watch?v=aircAruvnKk', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'Backpropagation — chain rule, gradient flow, vanishing/exploding gradients',
        difficulty: 'Advanced',
        pattern: 'Backpropagation',
        hint: 'Backpropagation applies chain rule through the computational graph. Gradient clipping handles exploding, batch norm handles vanishing.',
        approach: 'Implement backprop from scratch for a 2-layer MLP using only NumPy. Verify with numeric gradient checking.',
        proTip: 'Andrej Karpathy\'s micrograd (only 150 lines of Python) is the best way to deeply understand backprop.',
        tags: ['backpropagation', 'chain-rule', 'gradients', 'deep-learning'],
        youtubeResources: [
          { title: 'Backpropagation — 3Blue1Brown', url: 'https://www.youtube.com/watch?v=Ilg3gGewQ5U', channel: '3Blue1Brown', duration: '14min' },
          { title: 'The spelled-out intro to neural networks (Karpathy micrograd)', url: 'https://www.youtube.com/watch?v=VMj-3S1tku0', channel: 'Andrej Karpathy', duration: '2.5h' },
          { title: 'Backpropagation — CampusX', url: 'https://www.youtube.com/watch?v=1Q_etC_GHHk', channel: 'CampusX', duration: '2h' },
        ],
      },
      {
        title: 'Optimizers — SGD, Momentum, Adam, AdamW, RMSProp',
        difficulty: 'Advanced',
        pattern: 'Optimization',
        hint: 'Adam = Momentum + RMSProp. AdamW adds weight decay correctly. Almost all modern LLMs use AdamW.',
        approach: 'Train the same network with SGD, Momentum, RMSProp, Adam. Plot and compare loss curves. Show why Adam converges faster.',
        proTip: 'AdamW is the standard optimizer for transformers. The W means weight decay is applied correctly (decoupled from adaptive LR).',
        tags: ['adam', 'optimizer', 'sgd', 'deep-learning'],
        youtubeResources: [
          { title: 'Gradient Descent and Optimizers — Andrej Karpathy', url: 'https://www.youtube.com/watch?v=k8fTYJPd3_I', channel: 'Andrej Karpathy', duration: '1h' },
          { title: 'Adam Optimizer — CampusX', url: 'https://www.youtube.com/watch?v=NE88eqLngkg', channel: 'CampusX', duration: '1h' },
        ],
      },
      {
        title: 'Regularization — Dropout, Batch Norm, Layer Norm, Weight Decay',
        difficulty: 'Advanced',
        pattern: 'Regularization',
        hint: 'Dropout randomly zeroes neurons during training. Batch Norm normalizes layer outputs. Layer Norm is used in Transformers (not Batch Norm).',
        approach: 'Compare a network: no regularization vs dropout(0.5) vs batch norm. Plot train/val loss. Show overfitting reduction.',
        proTip: 'Use Batch Norm for CNNs. Use Layer Norm for Transformers/LSTMs. They are NOT interchangeable.',
        tags: ['dropout', 'batch-norm', 'regularization', 'deep-learning'],
        youtubeResources: [
          { title: 'Dropout — StatQuest', url: 'https://www.youtube.com/watch?v=D8PJAL-MZv8', channel: 'StatQuest', duration: '7min' },
          { title: 'Batch Normalization — CampusX', url: 'https://www.youtube.com/watch?v=DtEq44FTPM4', channel: 'CampusX', duration: '1.5h' },
          { title: 'Regularization Techniques — Krish Naik', url: 'https://www.youtube.com/watch?v=EehRcPo1M-Q', channel: 'Krish Naik', duration: '1h' },
        ],
      },
    ],
  },
  {
    topicId: 'ai-pytorch',
    topicName: 'PyTorch & TensorFlow',
    topicEmoji: '🔥',
    phase: 'Phase 3: Deep Learning',
    phaseIndex: 3,
    tag: 'dl',
    items: [
      {
        title: 'PyTorch tensors, autograd, computational graph',
        difficulty: 'Intermediate',
        pattern: 'PyTorch',
        hint: 'PyTorch\'s dynamic computation graph (define-by-run) makes debugging easy. Autograd tracks operations for backward pass.',
        approach: 'Create tensors, do operations, call .backward(), inspect .grad. Build a computation graph for y = x^2 + 2x + 1. Verify gradient with calculus.',
        proTip: 'Use requires_grad=True only on parameters you want to optimize. context manager torch.no_grad() during inference saves memory.',
        tags: ['pytorch', 'tensors', 'autograd', 'deep-learning'],
        youtubeResources: [
          { title: 'PyTorch Tutorial for Beginners — Patrick Loeber', url: 'https://www.youtube.com/watch?v=EMXfZB8FVUA', channel: 'Python Engineer', duration: '2h' },
          { title: 'PyTorch Full Course — freeCodeCamp', url: 'https://www.youtube.com/watch?v=GIsg-ZUy0MY', channel: 'freeCodeCamp', duration: '3h' },
          { title: 'PyTorch Tutorials — CampusX', url: 'https://www.youtube.com/watch?v=U0i7-c3Vrgc', channel: 'CampusX', duration: 'Series' },
        ],
      },
      {
        title: 'Building custom nn.Module — Dataset, DataLoader, training loop',
        difficulty: 'Intermediate',
        pattern: 'PyTorch Training',
        hint: 'The standard PyTorch training loop: forward → compute loss → zero_grad → backward → optimizer.step. This is repeated millions of times.',
        approach: 'Build a complete pipeline: custom Dataset class, DataLoader with batch_size=32, train loop with validation. Train on MNIST or Iris.',
        proTip: 'Always call optimizer.zero_grad() BEFORE backward(). Forgetting this accumulates gradients and breaks training.',
        tags: ['pytorch', 'training-loop', 'dataset', 'dataloader'],
        youtubeResources: [
          { title: 'Neural Net from Scratch in PyTorch', url: 'https://www.youtube.com/watch?v=0oyCUWLL_fU', channel: 'Python Engineer', duration: '1.5h' },
          { title: 'Complete PyTorch Training Pipeline — Andrej Karpathy', url: 'https://www.youtube.com/watch?v=PaCmpygFfXo', channel: 'Andrej Karpathy', duration: '1h' },
        ],
      },
      {
        title: 'TensorFlow / Keras — Sequential API, Functional API, callbacks',
        difficulty: 'Intermediate',
        pattern: 'TensorFlow',
        hint: 'Keras is TensorFlow\'s high-level API. Sequential for simple stacks. Functional API for multi-input/output, residual connections.',
        approach: 'Build a Keras model both ways: Sequential for simple MLP, Functional API for ResNet-style skip connection. Use callbacks: EarlyStopping, ModelCheckpoint.',
        proTip: 'EarlyStopping(patience=5, restore_best_weights=True) is the simplest overfitting prevention. Always use it.',
        tags: ['tensorflow', 'keras', 'deep-learning'],
        youtubeResources: [
          { title: 'TensorFlow 2.0 Complete Course — freeCodeCamp', url: 'https://www.youtube.com/watch?v=tPYj3fFJGjk', channel: 'freeCodeCamp', duration: '7h' },
          { title: 'Keras Tutorial — Krish Naik', url: 'https://www.youtube.com/watch?v=IcZzRgTyVjk', channel: 'Krish Naik', duration: '2h' },
        ],
      },
    ],
  },
  {
    topicId: 'ai-cnn',
    topicName: 'Computer Vision & CNNs',
    topicEmoji: '👁️',
    phase: 'Phase 3: Deep Learning',
    phaseIndex: 3,
    tag: 'dl',
    items: [
      {
        title: 'CNNs — convolution, pooling, receptive field, architectures',
        difficulty: 'Intermediate',
        pattern: 'Computer Vision',
        hint: 'CNNs share weights across spatial positions — this is the key insight that makes them efficient for images.',
        approach: 'Visualize learned filters from a CNN trained on CIFAR-10. Show feature maps at different layers. Implement a CNN from scratch for MNIST.',
        proTip: 'Modern CNNs use Global Average Pooling instead of Flatten + Dense — fewer params, less overfitting.',
        tags: ['cnn', 'convolution', 'computer-vision', 'deep-learning'],
        youtubeResources: [
          { title: 'CNN Explained — 3Blue1Brown', url: 'https://www.youtube.com/watch?v=KuXjwB4LzSA', channel: '3Blue1Brown', duration: '10min' },
          { title: 'CNN Full Tutorial — CampusX', url: 'https://www.youtube.com/watch?v=zfiSAzpy9NM', channel: 'CampusX', duration: '3h' },
          { title: 'VGG, ResNet architectures — Krish Naik', url: 'https://www.youtube.com/watch?v=rQa-b0ahHZQ', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'Transfer Learning & Fine-tuning — ResNet, EfficientNet, ViT',
        difficulty: 'Intermediate',
        pattern: 'Transfer Learning',
        hint: 'Transfer learning: use pretrained weights (trained on ImageNet), freeze early layers, fine-tune final layers on your data.',
        approach: 'Fine-tune EfficientNetB0 on a custom dataset (e.g. cats vs dogs). Freeze base, train classifier head. Then unfreeze and fine-tune with small LR.',
        proTip: 'Use timm (PyTorch Image Models) library: 600+ pretrained models in 1 library. Start with EfficientNet or ViT.',
        tags: ['transfer-learning', 'resnet', 'fine-tuning', 'computer-vision'],
        youtubeResources: [
          { title: 'Transfer Learning — Krish Naik', url: 'https://www.youtube.com/watch?v=l4GqTzgYEPU', channel: 'Krish Naik', duration: '1.5h' },
          { title: 'Fine-tuning Pretrained Models — CampusX', url: 'https://www.youtube.com/watch?v=jTUkpVBbBFk', channel: 'CampusX', duration: '2h' },
        ],
      },
      {
        title: 'Object Detection — YOLO, anchor boxes, mAP metric',
        difficulty: 'Advanced',
        pattern: 'Object Detection',
        hint: 'YOLO divides image into SxS grid, predicts bounding boxes + class probabilities per cell. mAP = mean Average Precision.',
        approach: 'Run YOLOv8 on your own images using ultralytics library. Train on custom dataset. Compute mAP@0.5 on validation set.',
        proTip: 'YOLOv8 from ultralytics is currently the best library — 3 lines to train a custom object detector.',
        tags: ['yolo', 'object-detection', 'computer-vision'],
        youtubeResources: [
          { title: 'YOLO Object Detection — Nicholas Renotte', url: 'https://www.youtube.com/watch?v=m9fH9OWn8YM', channel: 'Nicholas Renotte', duration: '2h' },
          { title: 'YOLO from Scratch — Aladdin Persson', url: 'https://www.youtube.com/watch?v=n9_XyCGr-MI', channel: 'Aladdin Persson', duration: '3h' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════
  // PHASE 4: NLP & TRANSFORMERS
  // ════════════════════════════════════════════════
  {
    topicId: 'ai-nlp',
    topicName: 'NLP Fundamentals',
    topicEmoji: '📝',
    phase: 'Phase 4: NLP & Transformers',
    phaseIndex: 4,
    tag: 'dl',
    items: [
      {
        title: 'Text preprocessing — tokenization, stemming, lemmatization, spaCy',
        difficulty: 'Intermediate',
        pattern: 'NLP Preprocessing',
        hint: 'Modern NLP uses subword tokenization (BPE, WordPiece) not word-level. But understand classical first.',
        approach: 'Process a reviews dataset: lower → remove punctuation → tokenize → remove stopwords → lemmatize with spaCy. Build vocab, compute term frequencies.',
        proTip: 'spaCy is production-grade NLP. Use it for tokenization, NER, dependency parsing. NLTK is for learning.',
        tags: ['nlp', 'tokenization', 'spacy', 'preprocessing'],
        youtubeResources: [
          { title: 'NLP Tutorial for Beginners — CampusX', url: 'https://www.youtube.com/watch?v=fM4qTMfCoak', channel: 'CampusX', duration: '3h series' },
          { title: 'NLP with Python — Krish Naik', url: 'https://www.youtube.com/watch?v=6zm9NC9uRkk', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'Word Embeddings — Word2Vec, GloVe, FastText',
        difficulty: 'Intermediate',
        pattern: 'Word Embeddings',
        hint: 'Word2Vec learns word embeddings by predicting neighboring words (CBOW) or predicting context from a word (Skip-gram).',
        approach: 'Train Word2Vec on a corpus using gensim. Explore: king - man + woman = queen. Visualize with t-SNE. Compare Skip-gram vs CBOW quality.',
        proTip: 'FastText handles out-of-vocabulary words by using character n-grams. Better for morphologically rich languages.',
        tags: ['word2vec', 'embeddings', 'glove', 'nlp'],
        youtubeResources: [
          { title: 'Word2Vec — StatQuest', url: 'https://www.youtube.com/watch?v=viZrOnJclY0', channel: 'StatQuest', duration: '15min' },
          { title: 'Word Embeddings — CampusX', url: 'https://www.youtube.com/watch?v=1LBmHMBScrU', channel: 'CampusX', duration: '2h' },
        ],
      },
      {
        title: 'TF-IDF, Bag of Words, n-grams — classical NLP',
        difficulty: 'Beginner',
        pattern: 'Text Representation',
        hint: 'TF-IDF = Term Frequency × Inverse Document Frequency. Downweights common words and upweights rare meaningful words.',
        approach: 'Build a text classifier: TfidfVectorizer → LogisticRegression on 20 Newsgroups dataset. Compare unigrams vs bigrams. Inspect most informative features.',
        proTip: 'TF-IDF + Logistic Regression is a VERY strong baseline for text classification. Always start here.',
        tags: ['tfidf', 'bag-of-words', 'nlp', 'text-classification'],
        youtubeResources: [
          { title: 'TF-IDF Explained — StatQuest', url: 'https://www.youtube.com/watch?v=OymqCnh-ADA', channel: 'StatQuest', duration: '10min' },
          { title: 'Text Classification — CampusX', url: 'https://www.youtube.com/watch?v=3PjsAlZFBLQ', channel: 'CampusX', duration: '1.5h' },
        ],
      },
    ],
  },
  {
    topicId: 'ai-transformers',
    topicName: 'Transformer Architecture',
    topicEmoji: '⚡',
    phase: 'Phase 4: NLP & Transformers',
    phaseIndex: 4,
    tag: 'dl',
    items: [
      {
        title: 'Attention mechanism — Query, Key, Value, scaled dot-product',
        difficulty: 'Advanced',
        pattern: 'Attention',
        hint: 'Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) * V. The scaling by sqrt(d_k) prevents vanishing gradients.',
        approach: 'Implement self-attention from scratch in NumPy. Create Q, K, V matrices from a sentence. Compute attention weights. Visualize which tokens attend to which.',
        proTip: 'The "Attention is All You Need" paper (Vaswani et al. 2017) is 10 pages. Read it. It\'s the most important ML paper of the decade.',
        tags: ['attention', 'transformer', 'qkv', 'deep-learning'],
        youtubeResources: [
          { title: 'Attention is All You Need — Yannic Kilcher', url: 'https://www.youtube.com/watch?v=iDulhoQ2pro', channel: 'Yannic Kilcher', duration: '1.5h' },
          { title: 'Illustrated Transformer — CampusX', url: 'https://www.youtube.com/watch?v=4Bdc55j80l8', channel: 'CampusX', duration: '2h' },
          { title: 'Attention Mechanism from Scratch — Andrej Karpathy', url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY', channel: 'Andrej Karpathy', duration: '2h' },
        ],
      },
      {
        title: 'GPT architecture — autoregressive LM, next token prediction',
        difficulty: 'Advanced',
        pattern: 'GPT',
        hint: 'GPT uses DECODER-only transformer with causal (masked) self-attention. Trained to predict next token using teacher forcing.',
        approach: 'Build a tiny GPT from scratch (Karpathy\'s makemore/nanoGPT). Train on tiny Shakespeare. Understand how sampling temperature and top-k affect generation.',
        proTip: 'Andrej Karpathy\'s nanoGPT (GitHub) is 300 lines of clean PyTorch implementing a real GPT. Study it deeply.',
        tags: ['gpt', 'autoregressive', 'language-model', 'transformer'],
        youtubeResources: [
          { title: "Let's build GPT from scratch — Andrej Karpathy", url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY', channel: 'Andrej Karpathy', duration: '2h' },
          { title: 'GPT Architecture Explained — CampusX', url: 'https://www.youtube.com/watch?v=bCz4OMemCcA', channel: 'CampusX', duration: '2h' },
        ],
      },
      {
        title: 'BERT — masked language modeling, fine-tuning, embeddings',
        difficulty: 'Advanced',
        pattern: 'BERT',
        hint: 'BERT uses ENCODER-only transformer with bidirectional context. Pre-trained with MLM and NSP tasks.',
        approach: 'Fine-tune BERT for sentiment classification using Hugging Face. Extract BERT embeddings for semantic similarity. Compare BERT vs GPT representations.',
        proTip: 'DistilBERT is 40% smaller, 60% faster, and retains 97% of BERT performance. Use it when speed matters.',
        tags: ['bert', 'masked-lm', 'fine-tuning', 'transformer'],
        youtubeResources: [
          { title: 'BERT Explained — StatQuest', url: 'https://www.youtube.com/watch?v=xI0HHN5XKDo', channel: 'StatQuest', duration: '30min' },
          { title: 'Fine-tuning BERT — CampusX', url: 'https://www.youtube.com/watch?v=enXG5F-1y9k', channel: 'CampusX', duration: '2h' },
        ],
      },
      {
        title: 'Hugging Face Transformers — AutoModel, tokenizers, pipelines',
        difficulty: 'Intermediate',
        pattern: 'HuggingFace',
        hint: 'HuggingFace has 500k+ models. Master: AutoTokenizer, AutoModelForSequenceClassification, Trainer API, datasets library.',
        approach: 'Use pipeline() for zero-shot classification, sentiment, NER, question answering. Fine-tune a model using Trainer API on a custom dataset.',
        proTip: 'Hugging Face Spaces lets you demo your model for free. Deploy your fine-tuned model there for your portfolio.',
        tags: ['huggingface', 'transformers', 'nlp', 'fine-tuning'],
        youtubeResources: [
          { title: 'Hugging Face Course — Official', url: 'https://www.youtube.com/playlist?list=PLo2EIpI_JMQvWfQndUesu0nPBAtZ9gP1o', channel: 'Hugging Face', duration: 'Full series' },
          { title: 'Hugging Face Transformers — CampusX', url: 'https://www.youtube.com/watch?v=QEaBAZQCtwE', channel: 'CampusX', duration: '3h' },
        ],
      },
      {
        title: 'LoRA & QLoRA — parameter-efficient fine-tuning',
        difficulty: 'Advanced',
        pattern: 'PEFT',
        hint: 'LoRA adds low-rank adapters (r=8 or 16) to attention weight matrices. QLoRA = LoRA + 4-bit quantization = fine-tune 13B model on 1 GPU.',
        approach: 'Fine-tune Llama 3 with QLoRA using Hugging Face PEFT library. Set r=16, alpha=32, target_modules=["q_proj","v_proj"]. Train on custom instruction dataset.',
        proTip: 'Use Unsloth library for 2x faster LoRA fine-tuning with 50% less VRAM. It\'s the go-to for QLoRA in 2025.',
        tags: ['lora', 'qlora', 'peft', 'fine-tuning', 'llm'],
        youtubeResources: [
          { title: 'LoRA & QLoRA Fine-tuning — CampusX', url: 'https://www.youtube.com/watch?v=Us5ZFp16PaU', channel: 'CampusX', duration: '2.5h' },
          { title: 'Fine-tune LLM with QLoRA', url: 'https://www.youtube.com/watch?v=eC6Hd1hFvos', channel: 'Krish Naik', duration: '2h' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════
  // PHASE 5: GENERATIVE AI
  // ════════════════════════════════════════════════
  {
    topicId: 'ai-llm',
    topicName: 'Large Language Models (LLMs)',
    topicEmoji: '🤖',
    phase: 'Phase 5: Generative AI',
    phaseIndex: 5,
    tag: 'genai',
    items: [
      {
        title: 'LLM internals — tokenization, context window, KV cache, sampling',
        difficulty: 'Advanced',
        pattern: 'LLM Architecture',
        hint: 'BPE tokenization, positional encodings, KV cache avoids recomputing past tokens, sampling strategies (temperature, top-p, top-k) control creativity.',
        approach: 'Use tiktoken to tokenize text. Observe how "python" is 1 token but "pythons" is 2. Understand why context window limits matter. Implement temperature sampling.',
        proTip: 'KV cache is why inference is faster for batch size=1 vs batch size=32. Understanding this helps you optimize cost.',
        tags: ['llm', 'tokenization', 'kv-cache', 'context-window'],
        youtubeResources: [
          { title: "Let's build the GPT Tokenizer — Andrej Karpathy", url: 'https://www.youtube.com/watch?v=zduSFxRajkE', channel: 'Andrej Karpathy', duration: '2h' },
          { title: 'LLMs Explained in Depth — CampusX', url: 'https://www.youtube.com/watch?v=LPZh9BOjkQs', channel: 'CampusX', duration: '3h' },
        ],
      },
      {
        title: 'Prompt Engineering — zero-shot, few-shot, chain-of-thought, ReAct',
        difficulty: 'Intermediate',
        pattern: 'Prompt Engineering',
        hint: 'Chain-of-thought (CoT) prompting dramatically improves reasoning by asking the model to "think step by step".',
        approach: 'Test on GPT-4/Claude: basic prompt vs few-shot vs CoT on math word problems. Measure accuracy. Implement ReAct pattern for multi-step problem solving.',
        proTip: 'Use XML tags in prompts for structured input (e.g. <document>, <question>). Claude responds especially well to this.',
        tags: ['prompt-engineering', 'chain-of-thought', 'few-shot', 'llm'],
        youtubeResources: [
          { title: 'Prompt Engineering Guide — LearnDataWithMark', url: 'https://www.youtube.com/watch?v=dOxUroR57xs', channel: 'LearnDataWithMark', duration: '1h' },
          { title: 'Prompt Engineering — CampusX', url: 'https://www.youtube.com/watch?v=_ZvnD73m40o', channel: 'CampusX', duration: '2h' },
        ],
      },
      {
        title: 'Anthropic Claude & OpenAI API — streaming, function calling, tool use',
        difficulty: 'Intermediate',
        pattern: 'LLM APIs',
        hint: 'Both APIs support: system prompts, multi-turn conversations, streaming responses, function/tool calling for structured outputs.',
        approach: 'Build a conversational chatbot maintaining history. Add function calling to query a weather API. Stream responses to the frontend.',
        proTip: 'Use structured outputs (OpenAI JSON mode or Claude with XML) for reliable data extraction from LLMs.',
        tags: ['openai', 'claude', 'anthropic', 'api', 'llm'],
        youtubeResources: [
          { title: 'OpenAI API Full Tutorial — Tech With Tim', url: 'https://www.youtube.com/watch?v=c-g6epk3fFE', channel: 'Tech With Tim', duration: '2h' },
          { title: 'Claude API + Anthropic SDK — CampusX', url: 'https://www.youtube.com/watch?v=QgaTR2XHKRI', channel: 'CampusX', duration: '1.5h' },
        ],
      },
      {
        title: 'Local LLMs — Ollama, Llama.cpp, quantization (GGUF, GPTQ, AWQ)',
        difficulty: 'Advanced',
        pattern: 'Local LLM Deployment',
        hint: 'Run LLMs locally with Ollama (Llama 3, Mistral, Phi-3). Quantization reduces model size: Q4_K_M = 4-bit quantized. ~4GB for 7B model.',
        approach: 'Install Ollama, pull Llama3.1:8b, run local inference. Compare Q4 vs Q8 quality. Use llama.cpp for C++ inference speed.',
        proTip: 'Ollama makes local LLMs trivially easy. Use it for dev/testing. For production, use Together.ai or Groq (fast API).',
        tags: ['ollama', 'llama', 'local-llm', 'quantization', 'gguf'],
        youtubeResources: [
          { title: 'Ollama Complete Guide', url: 'https://www.youtube.com/watch?v=90ozfQ9Ma_E', channel: 'Matthew Berman', duration: '1h' },
          { title: 'Local LLMs with Ollama — CampusX', url: 'https://www.youtube.com/watch?v=_WCqMbLfJEo', channel: 'CampusX', duration: '1.5h' },
        ],
      },
    ],
  },
  {
    topicId: 'ai-rag',
    topicName: 'RAG & Vector Databases',
    topicEmoji: '🔗',
    phase: 'Phase 5: Generative AI',
    phaseIndex: 5,
    tag: 'genai',
    items: [
      {
        title: 'RAG — end-to-end pipeline: ingest, chunk, embed, retrieve, generate',
        difficulty: 'Advanced',
        pattern: 'RAG',
        hint: 'RAG = give LLM access to external knowledge without fine-tuning. Steps: chunk docs → embed → store in vector DB → semantic search → pass to LLM.',
        approach: 'Build PDF chatbot: load with PyPDF2, chunk with RecursiveCharacterTextSplitter (chunk_size=1000, overlap=200), embed with sentence-transformers, store in ChromaDB, query with LLM.',
        proTip: 'Chunk overlap (200 tokens) prevents context loss at chunk boundaries. This alone greatly improves retrieval quality.',
        tags: ['rag', 'retrieval', 'vector-db', 'genai'],
        youtubeResources: [
          { title: 'RAG from Scratch — CampusX', url: 'https://www.youtube.com/watch?v=sVcwVQRHIc8', channel: 'CampusX', duration: '3h' },
          { title: 'RAG Pipeline — Krish Naik', url: 'https://www.youtube.com/watch?v=MFe7bYSMoqQ', channel: 'Krish Naik', duration: '2h' },
          { title: 'Advanced RAG Techniques — LangChain', url: 'https://www.youtube.com/watch?v=oxW7bN2MAGI', channel: 'LangChain', duration: '1.5h' },
        ],
      },
      {
        title: 'Vector Databases — ChromaDB, Pinecone, Weaviate, FAISS',
        difficulty: 'Advanced',
        pattern: 'Vector Search',
        hint: 'Vector DBs store embeddings and do approximate nearest neighbor (ANN) search. FAISS is best locally. Pinecone/Weaviate for production.',
        approach: 'Build with ChromaDB: create collection, add 1000 documents with embeddings, query with cosine similarity, filter with metadata. Compare FAISS search speed.',
        proTip: 'Use FAISS for experimentation (free, fast). Use Pinecone or Weaviate for production (managed, scalable).',
        tags: ['chromadb', 'pinecone', 'faiss', 'vector-db', 'embeddings'],
        youtubeResources: [
          { title: 'Vector Databases Explained — CampusX', url: 'https://www.youtube.com/watch?v=dN0lsF2cvm4', channel: 'CampusX', duration: '2h' },
          { title: 'Pinecone + LangChain — Krish Naik', url: 'https://www.youtube.com/watch?v=erUfLIi9OFM', channel: 'Krish Naik', duration: '1.5h' },
        ],
      },
      {
        title: 'Advanced RAG — reranking, HyDE, parent-child chunking, GraphRAG',
        difficulty: 'Advanced',
        pattern: 'Advanced RAG',
        hint: 'HyDE: generate a hypothetical answer, embed it, find similar real docs. Reranking: use cross-encoder to re-score top-k retrieved docs.',
        approach: 'Add Cohere Rerank to your RAG pipeline. Compare quality with/without reranking. Implement HyDE. Try sentence-window vs parent-child chunking.',
        proTip: 'Reranking consistently improves RAG quality by 10-30%. Cohere Rerank API is the easiest to integrate.',
        tags: ['advanced-rag', 'reranking', 'hyde', 'graphrag'],
        youtubeResources: [
          { title: 'Advanced RAG — LlamaIndex', url: 'https://www.youtube.com/watch?v=TRjq7t2Ms5I', channel: 'LlamaIndex', duration: '2h' },
          { title: 'GraphRAG — CampusX', url: 'https://www.youtube.com/watch?v=knDDGYHnnSI', channel: 'CampusX', duration: '2h' },
        ],
      },
    ],
  },
  {
    topicId: 'ai-agents',
    topicName: 'AI Agents & Agentic Systems',
    topicEmoji: '🕵️',
    phase: 'Phase 5: Generative AI',
    phaseIndex: 5,
    tag: 'genai',
    items: [
      {
        title: 'LangChain — chains, agents, document loaders, memory',
        difficulty: 'Intermediate',
        pattern: 'LangChain',
        hint: 'LangChain chains together: LLM + prompts + tools + memory. LangChain Expression Language (LCEL) is the modern way to compose chains.',
        approach: 'Build: document QA chain with LCEL, an agent with Wikipedia tool, a chatbot with ConversationBufferMemory. Deploy with LangServe.',
        proTip: 'Use LCEL (LangChain Expression Language) not legacy chains. Use | operator to pipe components.',
        tags: ['langchain', 'agents', 'chains', 'genai'],
        youtubeResources: [
          { title: 'LangChain Full Course — CampusX', url: 'https://www.youtube.com/watch?v=_FpT1cwcSLg', channel: 'CampusX', duration: '4h' },
          { title: 'LangChain Tutorial — Krish Naik', url: 'https://www.youtube.com/watch?v=lG7Uxts9SXs', channel: 'Krish Naik', duration: '3h' },
        ],
      },
      {
        title: 'AI Agents — ReAct, tool use, function calling, multi-step reasoning',
        difficulty: 'Advanced',
        pattern: 'AI Agents',
        hint: 'ReAct = Reasoning + Acting. Agent loop: Thought → Action (call tool) → Observation → Thought → Final Answer.',
        approach: 'Build a ReAct agent with tools: Python REPL, web search, calculator. Test on multi-step math word problems. Implement tool input validation.',
        proTip: 'Use LangSmith to trace agent runs — you can see exactly what the agent thought at each step.',
        tags: ['agents', 'react', 'tool-use', 'genai'],
        youtubeResources: [
          { title: 'AI Agents Explained — CampusX', url: 'https://www.youtube.com/watch?v=pBPtjMT_OPI', channel: 'CampusX', duration: '3h' },
          { title: 'AI Agents from Scratch — Andrej Karpathy', url: 'https://www.youtube.com/watch?v=bZQun8Y4L2A', channel: 'Andrej Karpathy', duration: '1h' },
        ],
      },
      {
        title: 'Multi-agent frameworks — LangGraph, CrewAI, AutoGen',
        difficulty: 'Advanced',
        pattern: 'Multi-Agent Systems',
        hint: 'LangGraph builds stateful agent workflows as graphs. CrewAI defines roles (Researcher, Writer, Critic) that collaborate. AutoGen uses conversation-based multi-agent.',
        approach: 'Build a CrewAI pipeline: Researcher agent finds info → Analyst agent interprets → Writer agent drafts report. Use LangGraph for a loop-based coding agent.',
        proTip: 'LangGraph is the most powerful for production — you control state, branching, and loops explicitly.',
        tags: ['langgraph', 'crewai', 'autogen', 'multi-agent'],
        youtubeResources: [
          { title: 'LangGraph Tutorial — CampusX', url: 'https://www.youtube.com/watch?v=R8KB-Zcynxw', channel: 'CampusX', duration: '3h' },
          { title: 'CrewAI Full Tutorial', url: 'https://www.youtube.com/watch?v=sPzc6hMg7So', channel: 'Brandon Hancock', duration: '2h' },
          { title: 'Multi-Agent AI — Krish Naik', url: 'https://www.youtube.com/watch?v=Df9RJC2EPnY', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'MCP (Model Context Protocol) — tool servers, server integration',
        difficulty: 'Advanced',
        pattern: 'MCP',
        hint: 'MCP is Anthropic\'s open standard for connecting LLMs to external data sources and tools via a common protocol.',
        approach: 'Build a custom MCP server that exposes a tool (e.g., database query). Connect to Claude using the MCP SDK. Test tool invocation.',
        proTip: 'MCP is becoming the industry standard. Many companies (GitHub, Google Drive, Slack) now have official MCP servers.',
        tags: ['mcp', 'tool-use', 'anthropic', 'agents'],
        youtubeResources: [
          { title: 'MCP Explained — Anthropic', url: 'https://www.youtube.com/watch?v=kQmXKXGP3cE', channel: 'Anthropic', duration: '30min' },
          { title: 'Build MCP Server — CampusX', url: 'https://www.youtube.com/watch?v=YAbdgQ0r_As', channel: 'CampusX', duration: '1.5h' },
        ],
      },
    ],
  },
  {
    topicId: 'ai-generative-models',
    topicName: 'Generative Models (GAN, VAE, Diffusion)',
    topicEmoji: '🎨',
    phase: 'Phase 5: Generative AI',
    phaseIndex: 5,
    tag: 'genai',
    items: [
      {
        title: 'GANs — Generator, Discriminator, training dynamics, Wasserstein GAN',
        difficulty: 'Advanced',
        pattern: 'GANs',
        hint: 'GAN = Generator (creates fakes) + Discriminator (detects fakes) in a minimax game. Wasserstein GAN fixes mode collapse and training instability.',
        approach: 'Train a GAN to generate MNIST digits from scratch. Implement DCGAN (Deep Convolutional GAN). Monitor discriminator/generator loss balance.',
        proTip: 'If Discriminator loss goes to 0 and Generator loss spikes — mode collapse. Use Wasserstein loss + gradient penalty (WGAN-GP).',
        tags: ['gan', 'dcgan', 'generative-models', 'deep-learning'],
        youtubeResources: [
          { title: 'GANs from Scratch — Aladdin Persson', url: 'https://www.youtube.com/watch?v=OljTVUVzPpM', channel: 'Aladdin Persson', duration: '2h' },
          { title: 'GAN Tutorial — CampusX', url: 'https://www.youtube.com/watch?v=TpMIssRdhco', channel: 'CampusX', duration: '3h' },
        ],
      },
      {
        title: 'VAEs — latent space, ELBO loss, reparameterization trick',
        difficulty: 'Advanced',
        pattern: 'VAEs',
        hint: 'VAE forces latent space to be a smooth Gaussian. ELBO = Reconstruction Loss + KL Divergence. The reparameterization trick makes it differentiable.',
        approach: 'Implement VAE on MNIST: encoder outputs (μ, σ), sample z = μ + σ*ε, decoder reconstructs. Interpolate in latent space between two digits.',
        proTip: 'Interpolating in the latent space of a VAE is magic — you can morph between any two images smoothly.',
        tags: ['vae', 'latent-space', 'generative-models'],
        youtubeResources: [
          { title: 'VAE Explained — StatQuest', url: 'https://www.youtube.com/watch?v=9zKuYvjFFS8', channel: 'StatQuest', duration: '18min' },
          { title: 'VAE from Scratch — Aladdin Persson', url: 'https://www.youtube.com/watch?v=VELQT1-hILo', channel: 'Aladdin Persson', duration: '2h' },
        ],
      },
      {
        title: 'Diffusion Models — DDPM, noise schedule, score matching, DDIM',
        difficulty: 'Advanced',
        pattern: 'Diffusion',
        hint: 'Diffusion models learn to denoise images: forward process adds Gaussian noise, reverse process learns to denoise step-by-step.',
        approach: 'Understand DDPM math: noise schedule (linear vs cosine), U-Net denoiser. Train a small diffusion model on MNIST. Use DDIM for faster sampling (10 steps vs 1000).',
        proTip: 'DDIM gives the same quality as DDPM with 10-50x fewer steps. This is what makes Stable Diffusion fast.',
        tags: ['diffusion', 'ddpm', 'ddim', 'generative-models'],
        youtubeResources: [
          { title: 'Diffusion Models from Scratch — Hugging Face', url: 'https://www.youtube.com/watch?v=a4Yfz2FxXiY', channel: 'Hugging Face', duration: '1.5h' },
          { title: 'DDPM Explained — Yannic Kilcher', url: 'https://www.youtube.com/watch?v=W-O7AZNzbzQ', channel: 'Yannic Kilcher', duration: '1.5h' },
          { title: 'Stable Diffusion Deep Dive — CampusX', url: 'https://www.youtube.com/watch?v=1CIpzeNxIhU', channel: 'CampusX', duration: '3h' },
        ],
      },
      {
        title: 'Multimodal Models — CLIP, LLaVA, GPT-4V, vision-language',
        difficulty: 'Advanced',
        pattern: 'Multimodal',
        hint: 'CLIP aligns image and text embeddings in the same space using contrastive learning. LLaVA connects CLIP vision encoder to an LLM decoder.',
        approach: 'Use CLIP for zero-shot image classification: encode image + class names as text → find closest match. Build a visual QA system with LLaVA.',
        proTip: 'GPT-4o, Claude 3.5 Sonnet, and Gemini are all multimodal. Vision capabilities are now a baseline expectation.',
        tags: ['multimodal', 'clip', 'llava', 'vision-language'],
        youtubeResources: [
          { title: 'CLIP Explained — Yannic Kilcher', url: 'https://www.youtube.com/watch?v=T9XSU0pKX2E', channel: 'Yannic Kilcher', duration: '1h' },
          { title: 'Multimodal LLMs — CampusX', url: 'https://www.youtube.com/watch?v=bCH0rspGOaI', channel: 'CampusX', duration: '2h' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════
  // PHASE 6: MLOPS & DEPLOYMENT
  // ════════════════════════════════════════════════
  {
    topicId: 'ai-mlops',
    topicName: 'MLOps & Deployment',
    topicEmoji: '🚢',
    phase: 'Phase 6: MLOps & Deployment',
    phaseIndex: 6,
    tag: 'deploy',
    items: [
      {
        title: 'FastAPI for ML model serving — REST API, async, health checks',
        difficulty: 'Intermediate',
        pattern: 'API Serving',
        hint: 'FastAPI is async, has automatic docs, and Pydantic validation. It\'s the standard for serving ML models as REST APIs.',
        approach: 'Wrap a scikit-learn or PyTorch model in FastAPI. Add /predict endpoint with Pydantic input validation. Add /health and /metrics endpoints. Test with httpx.',
        proTip: 'Use @app.on_event("startup") to load model once at startup, not on every request.',
        tags: ['fastapi', 'api', 'deployment', 'mlops'],
        youtubeResources: [
          { title: 'FastAPI for ML — CampusX', url: 'https://www.youtube.com/watch?v=h5wLuVDr0oc', channel: 'CampusX', duration: '2h' },
          { title: 'Deploy ML Model with FastAPI — Krish Naik', url: 'https://www.youtube.com/watch?v=b5F667g1yCk', channel: 'Krish Naik', duration: '1.5h' },
        ],
      },
      {
        title: 'Docker — containers, Dockerfiles, docker-compose for ML',
        difficulty: 'Intermediate',
        pattern: 'Containerization',
        hint: 'Docker makes "it works on my machine" a thing of the past. Your ML model + all dependencies packed into a portable container.',
        approach: 'Containerize your FastAPI ML model. Write Dockerfile: FROM python:3.11-slim → COPY requirements.txt → RUN pip install → COPY app → CMD uvicorn. Multi-stage build.',
        proTip: 'Use python:3.11-slim (not full) as base image. Add .dockerignore to exclude venv, __pycache__, .git.',
        tags: ['docker', 'containers', 'deployment', 'mlops'],
        youtubeResources: [
          { title: 'Docker for ML — CampusX', url: 'https://www.youtube.com/watch?v=pTFZFxd5uri', channel: 'CampusX', duration: '2h' },
          { title: 'Dockerize ML App — Krish Naik', url: 'https://www.youtube.com/watch?v=1t4iqba8UtA', channel: 'Krish Naik', duration: '1.5h' },
        ],
      },
      {
        title: 'MLflow — experiment tracking, model registry, model serving',
        difficulty: 'Intermediate',
        pattern: 'Experiment Tracking',
        hint: 'MLflow tracks: params, metrics, artifacts, code version. Model Registry promotes models from staging to production.',
        approach: 'Instrument your training script: mlflow.start_run() → log_param → log_metric → log_artifact → log_model. View in MLflow UI. Register the best run.',
        proTip: 'Add MLflow tracking to EVERY experiment from day 1. You will regret not tracking runs when you need to reproduce a result.',
        tags: ['mlflow', 'experiment-tracking', 'mlops'],
        youtubeResources: [
          { title: 'MLflow Complete Tutorial — CampusX', url: 'https://www.youtube.com/watch?v=qdcHHrsXA48', channel: 'CampusX', duration: '3h' },
          { title: 'MLflow with Python — Krish Naik', url: 'https://www.youtube.com/watch?v=a4Yfz2FxXiY', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'LLMOps — LangSmith, W&B, prompt management, LLM evaluation',
        difficulty: 'Advanced',
        pattern: 'LLMOps',
        hint: 'LLMOps = MLOps for LLM apps. LangSmith traces chains/agents. W&B logs LLM runs. Evaluation: LLM-as-judge, RAGAS for RAG evaluation.',
        approach: 'Add LangSmith tracing to your LangChain app. Set up RAGAS to evaluate RAG pipeline quality. Use W&B Prompts for prompt version management.',
        proTip: 'RAGAS metrics: faithfulness, answer_relevancy, context_precision. Automate these for CI/CD testing of your RAG pipeline.',
        tags: ['llmops', 'langsmith', 'weights-biases', 'evaluation'],
        youtubeResources: [
          { title: 'LangSmith Tutorial — LangChain', url: 'https://www.youtube.com/watch?v=tFXm5ijih98', channel: 'LangChain', duration: '1h' },
          { title: 'RAG Evaluation with RAGAS — CampusX', url: 'https://www.youtube.com/watch?v=KHgCqWMxLVE', channel: 'CampusX', duration: '2h' },
        ],
      },
      {
        title: 'Cloud ML — AWS SageMaker, Google Vertex AI, HuggingFace Spaces',
        difficulty: 'Advanced',
        pattern: 'Cloud Deployment',
        hint: 'SageMaker: managed training + endpoints. Vertex AI: Pipelines + Feature Store. HuggingFace Spaces: free model demos with Gradio.',
        approach: 'Deploy a model to SageMaker endpoint. Build a Gradio app on HuggingFace Spaces. Compare cost of SageMaker vs EC2 for inference.',
        proTip: 'HuggingFace Spaces (free) is the best way to demo your AI projects for your portfolio. Everyone in AI knows it.',
        tags: ['aws', 'sagemaker', 'vertex-ai', 'cloud', 'deployment'],
        youtubeResources: [
          { title: 'Deploy on HuggingFace Spaces — Krish Naik', url: 'https://www.youtube.com/watch?v=3bSVKNKb_PY', channel: 'Krish Naik', duration: '1h' },
          { title: 'AWS SageMaker Tutorial — CampusX', url: 'https://www.youtube.com/watch?v=LkR3GNDB0HI', channel: 'CampusX', duration: '3h' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════
  // PHASE 7: PROJECTS
  // ════════════════════════════════════════════════
  {
    topicId: 'ai-projects',
    topicName: 'Portfolio Projects',
    topicEmoji: '🏗️',
    phase: 'Phase 7: Portfolio Projects',
    phaseIndex: 7,
    tag: 'project',
    items: [
      {
        title: 'House Price Prediction — end-to-end regression with EDA + XGBoost',
        difficulty: 'Beginner',
        pattern: 'Regression Project',
        hint: 'Classic Kaggle project. EDA → feature engineering → XGBoost → cross-val → submit. Aim for top 10% on leaderboard.',
        approach: 'Use Kaggle House Prices dataset. EDA, feature engineering (log-transform skewed features), XGBoost with Optuna tuning, model stacking.',
        proTip: 'Model stacking (XGBoost + LightGBM + Linear) often beats any single model by 1-2% on leaderboard.',
        tags: ['regression', 'xgboost', 'kaggle', 'project'],
        youtubeResources: [
          { title: 'House Price Prediction — CampusX', url: 'https://www.youtube.com/watch?v=45ryDIPHdGg', channel: 'CampusX', duration: '3h' },
          { title: 'Kaggle House Prices — Krish Naik', url: 'https://www.youtube.com/watch?v=xxKCKLhPfMw', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'PDF / Document Chatbot with RAG — full stack with ChromaDB + Claude/GPT',
        difficulty: 'Intermediate',
        pattern: 'RAG Project',
        hint: 'This project combines: document parsing, chunking, embeddings, vector DB, LLM integration, and a chat UI.',
        approach: 'Stack: PyPDF2 → RecursiveCharacterTextSplitter → sentence-transformers embeddings → ChromaDB → Claude/GPT answer → Streamlit UI. Add source citations.',
        proTip: 'Add source citations (which page/chunk the answer came from). This is what makes it production-quality.',
        tags: ['rag', 'chatbot', 'pdf', 'project', 'genai'],
        youtubeResources: [
          { title: 'RAG PDF Chatbot — CampusX', url: 'https://www.youtube.com/watch?v=RIWbalZ7sTo', channel: 'CampusX', duration: '3h' },
          { title: 'PDF Chat App — Krish Naik', url: 'https://www.youtube.com/watch?v=RHTjOGKlDyI', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'Fine-tuned LLM with LoRA — domain-specific model (medical/legal/code)',
        difficulty: 'Advanced',
        pattern: 'LLM Fine-tuning Project',
        hint: 'Fine-tune Llama 3.1 or Mistral on a domain-specific instruction dataset using QLoRA. Upload to HuggingFace.',
        approach: 'Collect/create 1000+ instruction pairs in your domain. Format as Alpaca/ShareGPT. Fine-tune with Unsloth+QLoRA. Evaluate with ROUGE. Push to HuggingFace Hub.',
        proTip: 'Use Unsloth for 2x faster training. It supports Llama 3, Mistral, Phi-3 and Gemma.',
        tags: ['llm', 'lora', 'fine-tuning', 'project', 'genai'],
        youtubeResources: [
          { title: 'Fine-tune Llama 3 with Unsloth — CampusX', url: 'https://www.youtube.com/watch?v=aQmoog_s8HE', channel: 'CampusX', duration: '3h' },
          { title: 'QLoRA Fine-tuning — Krish Naik', url: 'https://www.youtube.com/watch?v=eC6Hd1hFvos', channel: 'Krish Naik', duration: '2h' },
        ],
      },
      {
        title: 'Multi-Agent Research System — CrewAI/LangGraph orchestrating 3+ agents',
        difficulty: 'Advanced',
        pattern: 'Multi-Agent Project',
        hint: 'Build agents with distinct roles: Researcher (web search) → Analyst (synthesize) → Writer (draft report) → Critic (review).',
        approach: 'Use CrewAI with GPT-4/Claude. Define tools (Tavily search, Python REPL). Set up task dependencies. Generate a comprehensive research report on any topic.',
        proTip: 'Add human-in-the-loop (HITL) checkpoints between critical agent steps. This is what makes it production-safe.',
        tags: ['multi-agent', 'crewai', 'langgraph', 'project', 'genai'],
        youtubeResources: [
          { title: 'Multi-Agent System with CrewAI — CampusX', url: 'https://www.youtube.com/watch?v=sPzc6hMg7So', channel: 'CampusX', duration: '3h' },
        ],
      },
      {
        title: 'Real-time ML API — FastAPI + Docker + MLflow + drift monitoring',
        difficulty: 'Advanced',
        pattern: 'Production ML Project',
        hint: 'Production ML: model in FastAPI → Docker container → deployed on AWS/GCP → MLflow tracking → Evidently drift monitoring.',
        approach: 'Train churn prediction model → FastAPI endpoint → Dockerize → deploy to AWS EC2 → MLflow experiment tracking → Evidently report for data drift.',
        proTip: 'Add data drift monitoring from day 1 in production. Models decay silently — monitoring catches it before business impact.',
        tags: ['production', 'fastapi', 'docker', 'mlflow', 'project'],
        youtubeResources: [
          { title: 'End-to-End ML Project Deployment — Krish Naik', url: 'https://www.youtube.com/watch?v=MJ1vWb1rGwM', channel: 'Krish Naik', duration: '5h' },
          { title: 'ML Production Deployment — CampusX', url: 'https://www.youtube.com/watch?v=GWgqmkG6f0s', channel: 'CampusX', duration: '4h' },
        ],
      },
      {
        title: 'Recommendation System — collaborative filtering + LLM re-ranking',
        difficulty: 'Advanced',
        pattern: 'Recommendation System',
        hint: 'Hybrid approach: Matrix Factorization (collaborative filtering) for candidates, LLM for re-ranking and explanation.',
        approach: 'Use MovieLens dataset. Train SVD with Surprise library. Generate top-20 candidates. Use LLM to re-rank and explain recommendations based on user preferences.',
        proTip: 'Two-stage: retrieve (fast, approximate) → re-rank (slow, accurate). Used by YouTube, Netflix, Spotify.',
        tags: ['recommendation', 'collaborative-filtering', 'llm', 'project'],
        youtubeResources: [
          { title: 'Recommendation System — CampusX', url: 'https://www.youtube.com/watch?v=G4MBc40rjdU', channel: 'CampusX', duration: '3h' },
          { title: 'Movie Recommendation System — Krish Naik', url: 'https://www.youtube.com/watch?v=1xtrIEwY_zY', channel: 'Krish Naik', duration: '2h' },
        ],
      },
    ],
  },
];

async function seedAI() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  MongoDB connected');

    // Remove existing AI questions
    const deleted = await Question.deleteMany({ track: 'ai' });
    console.log(`🗑️   Cleared ${deleted.deletedCount} existing AI questions`);

    let totalInserted = 0;
    for (const topic of aiTopics) {
      const docs = topic.items.map((item, idx) => ({
        ...item,
        topicId: topic.topicId,
        topicName: topic.topicName,
        topicEmoji: topic.topicEmoji,
        track: 'ai',
        phase: topic.phase,
        phaseIndex: topic.phaseIndex,
        tag: item.tag || topic.tag,
        orderIndex: idx,
        platform: 'Course',
        companies: [],
        lcLink: '',
        lcNumber: '',
      }));
      await Question.insertMany(docs);
      console.log(`  ✅  ${topic.topicName.padEnd(40)} → ${docs.length} topics`);
      totalInserted += docs.length;
    }

    console.log(`\n📊  Total AI topics seeded: ${totalInserted} across ${aiTopics.length} subjects`);
    console.log('\nPhase breakdown:');
    const phases = {};
    aiTopics.forEach(t => {
      phases[t.phase] = (phases[t.phase] || 0) + t.items.length;
    });
    Object.entries(phases).forEach(([p, c]) => console.log(`  ${p}: ${c} topics`));

  } catch (err) {
    console.error('❌  Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDone. MongoDB connection closed.');
  }
}

seedAI();

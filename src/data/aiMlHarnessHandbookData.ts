export interface PlainNoteSection {
  id: string;
  number: string;
  title: string;
  category: string;
  whatItIs: string;
  whyWeNeedIt: string;
  howItWorks: string[];
  formulaOrSpec?: string;
  indianExample: string;
  pros: string[];
  limitations: string[];
  whenToUse: string;
  keyTakeaways: string[];
  interviewQa: { q: string; a: string }[];
  codeExample?: {
    title: string;
    language: 'python' | 'java' | 'typescript';
    code: string;
    contextHint: string;
  };
}

export interface VectorDbComparisonRow {
  name: string;
  type: string;
  bestFor: string;
  indexing: string;
  indianUseCase: string;
}

export interface HarnessLehStep {
  step: number;
  phase: 'Perceive' | 'Reason' | 'Plan' | 'Act' | 'Observe' | 'Iterate';
  title: string;
  harnessAction: string;
  toolOrGuardrail: string;
  budgetOrMetric: string;
}

/* ========================================================================== */
/* TRACK 1: 12 MACHINE LEARNING ALGORITHMS (PLAIN-LANGUAGE INDIAN NOTES)      */
/* ========================================================================== */

export const ML_12_ALGORITHMS_NOTES: PlainNoteSection[] = [
  {
    id: 'ml-linear-regression',
    number: '01',
    title: 'Linear Regression',
    category: 'Supervised · Regression',
    whatItIs:
      'Linear Regression predicts a continuous number (like house price or salary) by drawing the best straight line through your past data points.',
    whyWeNeedIt:
      'Whenever you want a fast, easy-to-explain numeric forecast—such as predicting monthly electricity bills, house rent, or cab fares—a straight-line relationship is the cleanest baseline to start with.',
    howItWorks: [
      'Take input features (x) like flat area in sq.ft, number of BHKs, and distance from Metro.',
      'Start with initial weights (m) and bias (c) to form the line y = m*x + c.',
      'Measure how far predictions are from actual prices using Mean Squared Error (MSE).',
      'Use Gradient Descent (or Ordinary Least Squares) to gently adjust weights until MSE is as small as possible.',
    ],
    formulaOrSpec: 'y = β0 + β1x1 + β2x2 + ... + βnxn   |   Loss (MSE) = (1/n) Σ (yi - ŷi)²',
    indianExample:
      'Predicting flat price in Noida or Gurugram (in ₹ Lakhs) from carpet area (sq.ft) and distance to Metro. For instance, Price = 12 Lakhs + 0.0065 × (Area in sq.ft) → a 1,200 sq.ft flat estimates around ₹90 Lakhs.',
    pros: [
      'Very simple to understand and explain to business stakeholders.',
      'Fast to train even on lakhs of rows with minimal compute.',
      'Each weight clearly tells you how much one feature increases or decreases the output.',
    ],
    limitations: [
      'Assumes a straight-line relationship; fails on curved/non-linear patterns.',
      'Very sensitive to extreme outliers (one ₹50 Crore bungalow skews the whole line).',
      'Multicollinearity (two correlated inputs like area in sq.ft and area in sq.m) makes weights unstable.',
    ],
    whenToUse:
      'When your target is a continuous number, features have roughly linear impact, and interpretability matters.',
    keyTakeaways: [
      'Always scale features before Gradient Descent and check for outliers.',
      'Use Ridge (L2) or Lasso (L1) regularization to stop overfitting when you have many features.',
    ],
    interviewQa: [
      {
        q: 'What is the difference between L1 (Lasso) and L2 (Ridge) regularization?',
        a: 'Lasso adds |w| penalty and can shrink useless feature weights all the way to zero (feature selection). Ridge adds w² penalty and shrinks weights smoothly close to zero without dropping them completely.',
      },
      {
        q: 'Why do we square errors in MSE instead of taking plain differences?',
        a: 'Plain positive and negative errors cancel each other out. Squaring makes every error positive, punishes big mistakes harder, and gives a smooth U-shaped curve for Gradient Descent.',
      },
    ],
    codeExample: {
      title: 'House Price Predictor (₹ Lakhs) with Scikit-Learn',
      language: 'python',
      contextHint: 'Simple Linear Regression predicting Delhi NCR flat prices in ₹ Lakhs from sq.ft area.',
      code: `from sklearn.linear_model import LinearRegression
import numpy as np

# Area in sq.ft -> Price in ₹ Lakhs
area_sqft = np.array([[800], [1000], [1200], [1500], [1800]])
price_lakhs = np.array([58, 72, 86, 108, 130])

model = LinearRegression()
model.fit(area_sqft, price_lakhs)

predicted = model.predict([[1350]])
print(f"Estimated price for 1350 sq.ft: ₹{predicted[0]:.2f} Lakhs")`,
    },
  },
  {
    id: 'ml-logistic-regression',
    number: '02',
    title: 'Logistic Regression',
    category: 'Supervised · Classification',
    whatItIs:
      'Despite its name, Logistic Regression is a classification algorithm. It outputs a probability between 0 and 1 to decide Yes/No (Binary) or Multi-Class outcomes.',
    whyWeNeedIt:
      'Linear Regression can output -15 or +240, which makes no sense for a Yes/No decision. Logistic Regression passes the linear score through a Sigmoid S-curve so the output always stays neatly between 0 and 1.',
    howItWorks: [
      'Compute the weighted linear score z = w·x + b.',
      'Pass z through the Sigmoid function σ(z) = 1 / (1 + e^-z) to convert it into probability p ∈ (0, 1).',
      'Compare p against a threshold (usually 0.5): if p ≥ 0.5 predict 1 (Yes), else 0 (No).',
      'Train weights by minimizing Binary Cross-Entropy (Log Loss) using Gradient Descent.',
    ],
    formulaOrSpec: 'P(y=1|x) = σ(z) = 1 / (1 + e^-(w·x + b))   |   Log Loss = -[y log(p) + (1-y) log(1-p)]',
    indianExample:
      'Telecom Churn Prediction: Will a prepaid customer on a ₹499 or ₹799 recharge plan port out next month? If the model outputs 0.82 (82% churn probability), the retention team sends a cashback offer.',
    pros: [
      'Gives calibrated probabilities, not just hard Yes/No labels.',
      'Fast, lightweight, and works well as a strong baseline for fraud, spam, and churn.',
      'Easy to tune the decision threshold, such as lowering it to 0.30 for high-recall fraud alerts or raising it to 0.80 for strict spam blocking.',
    ],
    limitations: [
      'Can only create linear decision boundaries unless you add polynomial features.',
      'Struggles when classes are heavily imbalanced without class weights or SMOTE.',
    ],
    whenToUse:
      'For binary or multi-class classification when you need fast probability scores and clear feature importance.',
    keyTakeaways: [
      'Do not use MSE for Logistic Regression—Log Loss makes the cost surface convex.',
      'In imbalanced tasks like UPI fraud, judge the model using Precision, Recall, F1, and PR-AUC—not plain Accuracy.',
    ],
    interviewQa: [
      {
        q: 'Why is Logistic Regression called Regression if it does Classification?',
        a: 'Under the hood, it fits a linear regression equation to predict the log-odds (logit) of the positive class, then squashes that score into a 0–1 probability via the Sigmoid function.',
      },
      {
        q: 'Why is Accuracy a misleading metric for UPI fraud detection?',
        a: 'If 99.9% of UPI transactions are genuine, a dummy model that predicts "Not Fraud" every single time gets 99.9% accuracy while missing 100% of real frauds. Precision, Recall, and PR-AUC measure real fraud detection quality.',
      },
    ],
  },
  {
    id: 'ml-decision-tree',
    number: '03',
    title: 'Decision Tree',
    category: 'Supervised · Classification & Regression',
    whatItIs:
      'A Decision Tree splits your data step by step using simple if-else questions—just like a flowchart—until it reaches a clear final decision at a leaf node.',
    whyWeNeedIt:
      'Real-world decisions are rarely straight lines. Decision Trees naturally handle non-linear rules, mixed numeric + categorical features, and require zero feature scaling.',
    howItWorks: [
      'Start at the root node with all training rows.',
      'Test candidate feature splits and measure how "pure" the child groups become using Gini Impurity or Entropy (Information Gain).',
      'Pick the split with the highest Information Gain (lowest impurity) and branch left/right.',
      'Repeat recursively until nodes are pure or you hit a stopping rule like max_depth or min_samples_split.',
    ],
    formulaOrSpec: 'Gini = 1 - Σ p_i²   |   Entropy = -Σ p_i log2(p_i)   |   Info Gain = Parent - Weighted Child',
    indianExample:
      'Bank Loan Approval: First check "Is CIBIL score ≥ 750?" If Yes, check "Is annual income ≥ ₹8 Lakhs?" If Yes → Approve Loan; otherwise check existing EMI-to-income ratio.',
    pros: [
      'Zero feature scaling needed; handles both numbers and categories directly.',
      'Super easy to visualize and audit (banks love explainable approval rules).',
      'Captures non-linear feature interactions automatically.',
    ],
    limitations: [
      'Single deep trees overfit badly—they memorize training rows instead of generalizing.',
      'High variance: changing a few training rows can completely alter the top split.',
    ],
    whenToUse:
      'When you need transparent rule-based decisions or as building blocks inside ensembles (Random Forest / XGBoost).',
    keyTakeaways: [
      'Always prune trees using max_depth, min_samples_leaf, or cost-complexity pruning (ccp_alpha).',
      'Gini is slightly faster to compute than Entropy (no log calculation) and gives almost identical splits.',
    ],
    interviewQa: [
      {
        q: 'How do you stop a Decision Tree from overfitting?',
        a: 'Use pre-pruning (set max_depth, min_samples_split, min_samples_leaf) or post-pruning (grow full tree and trim weak branches using validation loss), or upgrade to Random Forest.',
      },
      {
        q: 'Why do Decision Trees not require feature scaling such as StandardScaler?',
        a: 'Trees split data using single-feature threshold comparisons such as `income >= 800000` rather than Euclidean distances or gradient weights, so scaling a column by 100× leaves every split point identical.',
      },
    ],
  },
  {
    id: 'ml-random-forest',
    number: '04',
    title: 'Random Forest',
    category: 'Ensemble · Bagging',
    whatItIs:
      'Random Forest builds a crowd of many independent Decision Trees (say 100–500) on random data subsets and takes a majority vote (classification) or average (regression).',
    whyWeNeedIt:
      'A single Decision Tree is moody and overfits. Asking 200 diverse trees and combining their answers dramatically lowers variance—like asking 10 experienced doctors instead of relying on 1 opinion.',
    howItWorks: [
      'Bootstrap Sampling: Create B random datasets by sampling rows with replacement from the original data.',
      'Feature Randomness: At every split in each tree, only evaluate a random subset of √p features so trees stay diverse instead of copying the same top split.',
      'Grow each tree independently in parallel.',
      'Aggregate predictions: Majority vote for classification, mean for regression.',
    ],
    formulaOrSpec: 'Prediction ŷ = MajorityVote(T1(x) through TB(x))   |   Bagging = Bootstrap + Aggregating',
    indianExample:
      'E-commerce Return Risk Prediction (Flipkart/Meesho): Combining 200 trees trained on delivery pincode, COD vs prepaid, category, and buyer history to flag high RTO (Return-to-Origin) orders.',
    pros: [
      'Very robust against overfitting compared to a single tree.',
      'Gives built-in feature importance and Out-of-Bag (OOB) validation error.',
      'Trains easily in parallel across multiple CPU cores.',
    ],
    limitations: [
      'Slower inference and larger memory footprint when storing hundreds of deep trees.',
      'Harder to interpret than a single small Decision Tree.',
    ],
    whenToUse:
      'Strong out-of-the-box default for tabular data when you want high accuracy with minimal hyperparameter tuning.',
    keyTakeaways: [
      'Two sources of randomness make Random Forest work: row bootstrapping + random feature subsets per split.',
      'Bagging reduces Variance; Boosting reduces Bias.',
    ],
    interviewQa: [
      {
        q: 'Why does Random Forest pick a random subset of features at every split?',
        a: 'If one strong feature dominates every tree, all trees become correlated copies and averaging stops helping. Random feature selection decorrelates the trees so ensemble voting actually cuts variance.',
      },
      {
        q: 'What is Out-of-Bag (OOB) error in Random Forest?',
        a: 'Because each tree is trained on a bootstrap sample with replacement, roughly 37% of rows are left out for that tree. Evaluating each row using only the trees that never saw it gives a free validation score without a separate split.',
      },
    ],
  },
  {
    id: 'ml-svm',
    number: '05',
    title: 'Support Vector Machine (SVM)',
    category: 'Supervised · Max-Margin Classifier',
    whatItIs:
      'SVM finds the widest possible "road" (margin) separating two classes so that new unseen points land safely on the right side.',
    whyWeNeedIt:
      'Many lines can separate two classes, but a line hugging the data points tightly will fail on noisy test inputs. Maximizing the margin creates the safest boundary.',
    howItWorks: [
      'Find the hyperplane w·x + b = 0 that separates classes with the maximum margin width 2 / ||w||.',
      'Only the closest boundary points—called Support Vectors—define the hyperplane; distant points do not move it.',
      'Use parameter C (Soft Margin) to balance strict separation vs tolerating a few noisy misclassifications.',
      'When data is not linearly separable, apply the Kernel Trick (RBF, Polynomial) to implicitly map points to a higher dimension where a flat plane separates them.',
    ],
    formulaOrSpec: 'Maximize Margin = 2 / ||w||   |   RBF Kernel: K(x, x\') = exp(-γ ||x - x\'||²)',
    indianExample:
      'Email Spam vs Genuine Banking Alerts: Text TF-IDF vectors live in thousands of dimensions where Linear/RBF SVM draws a crisp boundary between legitimate HDFC/SBI OTP messages and phishing spam.',
    pros: [
      'Works remarkably well in high-dimensional spaces (even when features > samples).',
      'Memory-efficient because only Support Vectors are stored for prediction.',
      'Kernel trick handles complex curved boundaries cleanly.',
    ],
    limitations: [
      'Slow to train on very large datasets (O(n²) to O(n³) time).',
      'Strictly requires feature scaling (StandardScaler) and careful tuning of C and gamma.',
    ],
    whenToUse:
      'Medium-sized, high-dimensional datasets (text classification, bioinformatics, clean boundary detection).',
    keyTakeaways: [
      'High C = strict margin (risk of overfitting). Low C = wider, softer margin (better generalization).',
      'Always standardize numeric inputs before fitting an SVM.',
    ],
    interviewQa: [
      {
        q: 'What is the Kernel Trick in simple words?',
        a: 'Instead of actually computing expensive high-dimensional coordinates for every point, a kernel function computes their dot product directly in the original space—giving non-linear boundaries at low cost.',
      },
      {
        q: 'How does changing the regularization parameter C affect an SVM boundary?',
        a: 'A very large C forces a narrow, strict margin with almost zero training mistakes, which risks overfitting noise. A smaller C widens the margin and accepts a few boundary violations to generalize better on unseen test data.',
      },
    ],
  },
  {
    id: 'ml-knn',
    number: '06',
    title: 'K-Nearest Neighbors (KNN)',
    category: 'Supervised · Lazy Instance-Based',
    whatItIs:
      'KNN makes predictions by looking at the K closest past examples to a new point and copying their majority class or average value ("tell me your K closest friends, and I will tell you who you are").',
    whyWeNeedIt:
      'It requires zero mathematical assumptions about data shape and needs almost zero training time—it simply stores the dataset and looks up neighbors at query time.',
    howItWorks: [
      'Choose a positive integer K (usually odd like 3, 5, or 7 to avoid ties).',
      'For a new query point, compute distance to every training point using Euclidean, Manhattan, or Minkowski distance.',
      'Pick the K points with the smallest distance.',
      'Return the majority label (classification) or average value (regression).',
    ],
    formulaOrSpec: 'Euclidean = √Σ(xi - yi)²   |   Manhattan = Σ|xi - yi|   |   Minkowski = (Σ|xi - yi|^p)^(1/p)',
    indianExample:
      'Recommending similar residential societies in Bengaluru/Pune or classifying a new student\'s stream preference based on the K=5 closest peer profiles by marks and attendance.',
    pros: [
      'Zero training phase and trivial to implement.',
      'Naturally handles multi-class problems and irregular decision shapes.',
    ],
    limitations: [
      'Slow at prediction time on large datasets (must scan distances unless using KD-Tree / Ball-Tree / HNSW).',
      'Suffers from the Curse of Dimensionality and breaks completely if features are unscaled.',
    ],
    whenToUse:
      'Small-to-medium datasets with clean scaled features, or similarity-based lookup baselines.',
    keyTakeaways: [
      'Too small K (like K=1) overfits noise; too large K over-smooths and underfits.',
      'Always scale features so salary in ₹ Lakhs does not drown out age in years.',
    ],
    interviewQa: [
      {
        q: 'Why is KNN called a Lazy Learner?',
        a: 'Because it does not learn any parameters or equation during training. It simply memorizes the training data and performs all computation when a test query arrives.',
      },
      {
        q: 'Why does KNN fail badly when a dataset has 500 features?',
        a: 'In high dimensions, the Curse of Dimensionality pushes almost every point to roughly the same distance from every other point, so "nearest neighbor" stops carrying meaningful similarity unless you first reduce dimensions with PCA or use HNSW.',
      },
    ],
  },
  {
    id: 'ml-naive-bayes',
    number: '07',
    title: 'Naive Bayes',
    category: 'Supervised · Probabilistic',
    whatItIs:
      'Naive Bayes uses Bayes\' Theorem to calculate the probability of each class given the observed features, assuming every feature contributes independently ("naive" assumption).',
    whyWeNeedIt:
      'Even though real-world words or features are mildly correlated, the independence shortcut makes Naive Bayes blazing fast, tiny in memory, and surprisingly accurate on text.',
    howItWorks: [
      'Calculate Prior probability P(Class) from training label counts.',
      'Calculate Likelihood P(Feature | Class) for every feature value (Gaussian for numbers, Multinomial for word counts, Bernoulli for binary flags).',
      'Multiply Prior × all Likelihoods (or sum log-probabilities to avoid underflow).',
      'Apply Laplace Smoothing (+1) so unseen words never zero out the entire probability.',
    ],
    formulaOrSpec: 'P(C | X) = [ P(C) · Π P(xi | C) ] / P(X)',
    indianExample:
      'SMS Spam Filter: Words like "lottery", "kyc blocked", and "click now" have high likelihood under Spam, instantly flagging fraudulent SMS messages on-device in under a millisecond.',
    pros: [
      'Extremely fast to train and predict, even with 100,000+ text vocabulary features.',
      'Works well even with small training sets.',
    ],
    limitations: [
      'The independence assumption is rarely true in real life because paired words such as "New" and "Delhi" strongly depend on each other.',
      'Probability estimates can be overconfident even when the predicted class is right.',
    ],
    whenToUse:
      'Fast text classification baselines (spam filtering, sentiment tagging, support ticket routing).',
    keyTakeaways: [
      'Always use log probabilities and Laplace smoothing in production implementations.',
      'Pick MultinomialNB for word counts, GaussianNB for continuous bell-curve features.',
    ],
    interviewQa: [
      {
        q: 'What is the Zero-Frequency Problem in Naive Bayes and how do we fix it?',
        a: 'If a test word never appeared in a class during training, P(word|class)=0 wipes out the whole product to zero. Laplace smoothing adds a small alpha (usually 1) to every word count.',
      },
      {
        q: 'Why do production Naive Bayes models sum log-probabilities instead of multiplying raw probabilities?',
        a: 'Multiplying hundreds of tiny probabilities such as 0.0002 quickly underflows standard 64-bit floating-point numbers to 0.0. Taking logs converts multiplication into safe addition.',
      },
    ],
  },
  {
    id: 'ml-kmeans',
    number: '08',
    title: 'K-Means Clustering',
    category: 'Unsupervised · Partitioning',
    whatItIs:
      'K-Means groups unlabeled data into K neat clusters by placing K center points (centroids) and assigning every point to its nearest centroid.',
    whyWeNeedIt:
      'When you have customer or product data without labels, K-Means automatically discovers hidden segments so teams can design targeted campaigns or warehouse zones.',
    howItWorks: [
      'Pick the number of clusters K and initialize K centroids (use K-Means++ for smart spread-out starts).',
      'Assignment Step: Assign every data point to its nearest centroid by Euclidean distance.',
      'Update Step: Move each centroid to the average (mean) position of all points assigned to it.',
      'Repeat Assignment + Update until centroids stop moving.',
    ],
    formulaOrSpec: 'Minimize Inertia (WCSS) = Σ_k Σ_{x ∈ C_k} ||x - μ_k||²',
    indianExample:
      'Quick-Commerce Dark Store Placement (Blinkit/Zepto): Clustering daily delivery lat/long coordinates across Mumbai or Bengaluru into K=15 clusters so each centroid marks the optimal dark store location.',
    pros: [
      'Simple, fast, and scales smoothly to millions of records.',
      'Easy to interpret cluster centroids as "typical customer profiles".',
    ],
    limitations: [
      'You must pick K manually in advance (use Elbow Method or Silhouette Score).',
      'Assumes roughly spherical, equal-sized clusters; fails on crescent shapes or heavy outliers.',
    ],
    whenToUse:
      'Customer segmentation, store/hub location planning, and vector quantization.',
    keyTakeaways: [
      'Always use K-Means++ initialization and scale features before clustering.',
      'Combine Elbow Plot (WCSS) with Silhouette Score (-1 to +1) to select K.',
    ],
    interviewQa: [
      {
        q: 'How do you choose the right value of K in K-Means?',
        a: 'Plot WCSS (inertia) against K and look for the "elbow" where extra clusters give diminishing drops, and cross-check with Silhouette Score (higher = tighter, better-separated clusters).',
      },
      {
        q: 'Why is K-Means++ initialization preferred over plain random centroid selection?',
        a: 'Plain random initialization can drop two centroids right next to each other, trapping K-Means in a poor local minimum. K-Means++ spreads initial centroids far apart probabilistically, converging faster and more reliably.',
      },
    ],
  },
  {
    id: 'ml-hierarchical',
    number: '09',
    title: 'Hierarchical Clustering',
    category: 'Unsupervised · Tree / Dendrogram',
    whatItIs:
      'Hierarchical Clustering builds a family tree (Dendrogram) of clusters—either merging closest points bottom-up (Agglomerative) or splitting top-down (Divisive).',
    whyWeNeedIt:
      'Unlike K-Means, you do not have to guess K beforehand. You build the full similarity tree once and "slice" it at whichever height gives the cluster granularity you want.',
    howItWorks: [
      'Start with every data point as its own mini-cluster (N clusters).',
      'Compute pairwise distances between all clusters using a linkage rule (Single, Complete, Average, or Ward).',
      'Merge the two closest clusters and record the merge height in the Dendrogram.',
      'Repeat until all points merge into 1 big root cluster, then cut the Dendrogram at the longest vertical jump.',
    ],
    formulaOrSpec: 'Ward Linkage minimizes total within-cluster variance increase on each merge',
    indianExample:
      'Organizing an e-commerce catalog (Electronics → Mobiles → 5G Budget Phones under ₹15,000) or grouping regional Indian retail stores by sales mix without pre-committing to a fixed number of tiers.',
    pros: [
      'No need to specify K upfront.',
      'Dendrogram visually reveals nested sub-clusters and hierarchy.',
    ],
    limitations: [
      'Heavy O(n²) memory and O(n³) time—impractical beyond tens of thousands of rows.',
      'Early merge decisions can never be undone later.',
    ],
    whenToUse:
      'Small-to-medium datasets where taxonomy, nested groups, or visual Dendrogram inspection is valuable.',
    keyTakeaways: [
      'Ward linkage usually produces the cleanest compact clusters for numeric data.',
      'Cut the Dendrogram horizontally across the tallest vertical line that has no horizontal crossing.',
    ],
    interviewQa: [
      {
        q: 'When would you pick Hierarchical Clustering over K-Means?',
        a: 'When the dataset is modest in size, you do not know K ahead of time, and you want a deterministic hierarchy (Dendrogram) without random centroid restarts.',
      },
      {
        q: 'What is the chaining problem in Single Linkage Hierarchical Clustering?',
        a: 'Single Linkage measures distance between the two closest boundary points, so a line of noisy bridge points can falsely glue two completely separate clusters into one long snake. Ward or Complete Linkage avoids this.',
      },
    ],
  },
  {
    id: 'ml-pca',
    number: '10',
    title: 'Principal Component Analysis (PCA)',
    category: 'Unsupervised · Dimensionality Reduction',
    whatItIs:
      'PCA compresses many correlated features into a smaller set of new uncorrelated axes (Principal Components PC1 through PCk) that preserve as much information (variance) as possible.',
    whyWeNeedIt:
      'High-dimensional data slows down training, causes overfitting (Curse of Dimensionality), and cannot be plotted. PCA removes redundancy while keeping 95%+ of the signal.',
    howItWorks: [
      'Standardize all features (mean = 0, std = 1) so units do not distort variance.',
      'Compute the Covariance Matrix to see how every pair of features moves together.',
      'Find Eigenvectors (new axis directions) and Eigenvalues (variance captured along each axis).',
      'Sort by largest Eigenvalues and project original data onto the top K Principal Components (PC1 through PCk).',
    ],
    formulaOrSpec: 'Cov(X) = (1/(n-1)) XᵀX   |   Cov · v = λ · v   |   Keep top-k so Σλ_k / Σλ ≥ 0.95',
    indianExample:
      'Compressing 120 user behavior metrics from a UPI/fintech app (spending by category, time-of-day counts, merchant types) down to 12 clean components for faster credit-risk modeling and 2D cluster plots.',
    pros: [
      'Eliminates multicollinearity completely (all PCs are orthogonal).',
      'Speeds up downstream ML models and enables 2D/3D visualization.',
    ],
    limitations: [
      'New axes (PC1, PC2) are linear blends of original columns, making business interpretation harder.',
      'Only captures linear variance; for curved manifolds use t-SNE or UMAP.',
    ],
    whenToUse:
      'Before KNN/SVM/Linear models when you have many correlated numeric features, or for visualization and noise reduction.',
    keyTakeaways: [
      'Always fit PCA only on the Training set, then call .transform() on Validation/Test to prevent data leakage.',
      'Standardization before PCA is mandatory.',
    ],
    interviewQa: [
      {
        q: 'Does PCA drop original columns or create new ones?',
        a: 'It creates brand-new orthogonal features (linear combinations of the original columns) ranked by how much data variance each captures.',
      },
      {
        q: 'Why must you standardize numeric features before running PCA?',
        a: 'PCA maximizes variance. Without standardization, a feature measured in Rupees (variance in crores) completely dominates a feature measured in Years (variance in tens), forcing PC1 to copy the Rupees column alone.',
      },
    ],
  },
  {
    id: 'ml-gradient-boosting',
    number: '11',
    title: 'Gradient Boosting & XGBoost',
    category: 'Ensemble · Sequential Boosting',
    whatItIs:
      'Gradient Boosting builds shallow Decision Trees one after another, where each new tree specifically tries to fix the mistakes (residuals) left behind by all previous trees combined.',
    whyWeNeedIt:
      'For structured/tabular business data (SQL tables, CSVs, financial logs), Gradient Boosted Trees (XGBoost, LightGBM, CatBoost) consistently outperform neural networks and Random Forests.',
    howItWorks: [
      'Start with a simple constant base prediction such as the average house price across all training rows.',
      'Compute residual errors = (Actual - Predicted) — mathematically, the negative gradient of the loss function.',
      'Train a small new tree to predict those residual errors.',
      'Add the new tree scaled by a small learning rate η: F_new = F_old + η · Tree_m, and repeat M times.',
    ],
    formulaOrSpec: 'F_m(x) = F_{m-1}(x) + η · h_m(x)   |   XGBoost adds L1/L2 tree leaf penalties + 2nd-order Taylor expansion',
    indianExample:
      'Swiggy/Zomato Delivery ETA & Fraud Scoring: XGBoost combines restaurant prep time, traffic rain signals, rider distance, and time-of-day to predict exact delivery minutes with minimal error.',
    pros: [
      'State-of-the-art accuracy on almost every tabular ML competition and enterprise dataset.',
      'XGBoost/LightGBM handle missing values natively, support L1/L2 regularization, and parallelize split search.',
    ],
    limitations: [
      'Can overfit if trees are too deep or learning rate is too high without early stopping.',
      'Trees are built sequentially (each waits for the previous one), so tuning takes more care than Random Forest.',
    ],
    whenToUse:
      'Your go-to champion model for tabular classification and regression (credit scoring, ETA, churn, pricing, ranking).',
    keyTakeaways: [
      'GBM uses 1st-order gradients; XGBoost uses both 1st and 2nd-order derivatives plus built-in regularization.',
      'Pair a small learning_rate (0.03–0.1) with early_stopping_rounds on a validation set.',
    ],
    interviewQa: [
      {
        q: 'How is Random Forest different from Gradient Boosting (XGBoost)?',
        a: 'Random Forest grows deep trees independently in parallel (Bagging) to cut variance. Gradient Boosting grows shallow trees sequentially where each tree fixes prior errors (Boosting) to cut bias.',
      },
      {
        q: 'Why does XGBoost use a small learning rate (`eta` = 0.05) with many trees instead of `eta` = 1.0?',
        a: 'Taking small cautious steps prevents any single tree from over-correcting noisy training rows, giving smoother generalization when combined with early stopping on a validation set.',
      },
    ],
  },
  {
    id: 'ml-adaboost',
    number: '12',
    title: 'AdaBoost (Adaptive Boosting)',
    category: 'Ensemble · Weight-Rebalanced Boosting',
    whatItIs:
      'AdaBoost combines many tiny "weak learners" (usually 1-split decision stumps) sequentially by increasing the importance weight of misclassified rows so the next stump focuses harder on tough cases.',
    whyWeNeedIt:
      'Just like a student revising only the mock-test questions they got wrong, focusing successive weak models on hard examples turns simple rules into a strong classifier.',
    howItWorks: [
      'Assign equal weight (1/N) to every training example.',
      'Train a shallow Decision Stump (max_depth = 1) and measure its weighted error rate ε.',
      'Give this stump a voting power α = 0.5 · ln((1 - ε) / ε) — better stumps get louder votes.',
      'Increase weights of misclassified rows, decrease weights of correctly classified rows, normalize, and repeat.',
    ],
    formulaOrSpec: 'Stump Weight α_t = ½ ln((1 - ε_t) / ε_t)   |   Final H(x) = sign(Σ α_t · h_t(x))',
    indianExample:
      'Classic Face Detection (Viola-Jones) or clean binary KYC document checks where lightweight rules combined via AdaBoost run fast on low-power edge devices.',
    pros: [
      'Simple concept with very few hyperparameters (n_estimators, learning_rate).',
      'Turns tiny weak classifiers into an accurate boundary without deep trees.',
    ],
    limitations: [
      'Very sensitive to noisy labels and outliers—mislabelled rows keep getting higher and higher weights!',
      'Usually surpassed by XGBoost/LightGBM on complex modern tabular data.',
    ],
    whenToUse:
      'Clean binary classification problems or when you want a lightweight boosting baseline.',
    keyTakeaways: [
      'AdaBoost fixes mistakes by re-weighting rows; Gradient Boosting fixes mistakes by fitting residual gradients.',
      'Clean outliers/mislabeled rows before using AdaBoost.',
    ],
    interviewQa: [
      {
        q: 'Why does AdaBoost struggle with noisy outliers?',
        a: 'Because AdaBoost exponentially increases the weight of misclassified samples on every round, forcing later stumps to obsess over mislabeled outliers instead of the true pattern.',
      },
      {
        q: 'How is AdaBoost different from Gradient Boosting under the hood?',
        a: 'AdaBoost focuses on mistakes by increasing sample weights for misclassified rows using 1-split stumps, while Gradient Boosting leaves sample weights unchanged and fits new trees directly to the negative gradient (residual error) of any differentiable loss function.',
      },
    ],
  },
];

/* ========================================================================== */
/* TRACK 2: TRANSFORMERS, LLMS & INFERENCE DEEP DIVE                          */
/* ========================================================================== */

export const TRANSFORMER_LLM_NOTES: PlainNoteSection[] = [
  {
    id: 'llm-self-attention',
    number: '01',
    title: 'Self-Attention & Multi-Head Attention',
    category: 'Transformer Core',
    whatItIs:
      'Self-Attention lets every word (token) in a sentence look at all other words simultaneously and decide which ones matter most for understanding its meaning.',
    whyWeNeedIt:
      'Older RNNs and LSTMs read words one-by-one from left to right, forgetting early words in long paragraphs and preventing GPU parallelism. Self-Attention connects any two words in 1 step and runs fully in parallel.',
    howItWorks: [
      'Turn each token embedding into three vectors using learned weight matrices: Query (Q = what I am looking for), Key (K = what I contain), and Value (V = the info I pass along).',
      'Compute similarity scores between every Query and every Key via dot product: Q · Kᵀ.',
      'Divide by √d_k so dot products do not grow huge and push Softmax into flat zero-gradient zones.',
      'Apply Softmax to get attention weights summing to 1, then multiply by V to get the context-aware output.',
      'Multi-Head Attention runs h parallel attention heads (commonly 8, 16, or 32) so one head tracks grammar, another tracks pronouns, and another tracks topic context, then concatenates them.',
    ],
    formulaOrSpec: 'Attention(Q, K, V) = softmax( (Q · Kᵀ) / √d_k ) · V',
    indianExample:
      'In the sentence "Rahul booked a Tatkal ticket on IRCTC, but it timed out before payment", Self-Attention links the pronoun "it" strongly to "IRCTC" / "ticket" rather than "Rahul".',
    pros: [
      'Captures long-range dependencies in O(1) path length regardless of sentence gap.',
      '100% parallelizable on GPUs during training via matrix multiplication.',
    ],
    limitations: [
      'Standard attention costs O(n²) time and memory in sequence length n (handled in modern LLMs via FlashAttention & GQA).',
    ],
    whenToUse:
      'Core building block of every modern LLM, code assistant, translation engine, and vision/audio transformer.',
    keyTakeaways: [
      'Q, K, V are simply three different linear projections of the same input tokens.',
      'Scaling by √d_k keeps variance ≈ 1 so gradients stay healthy during backpropagation.',
    ],
    interviewQa: [
      {
        q: 'Why do we divide QKᵀ by √d_k in Scaled Dot-Product Attention?',
        a: 'When vector dimension d_k is large (like 64 or 128), raw dot products get very large in magnitude, pushing Softmax into extreme 0 or 1 regions where gradients almost vanish. Dividing by √d_k keeps values well-behaved.',
      },
      {
        q: 'Why use Multi-Head Attention instead of one big single head?',
        a: 'A single head averages everything into one attention map. Multiple heads let the model attend to different relationships at once—syntax, coreference, numeric units, and domain meaning.',
      },
    ],
  },
  {
    id: 'llm-arch-blocks',
    number: '02',
    title: 'Positional Encoding, FFN, LayerNorm & Encoder vs Decoder',
    category: 'Architecture Blueprint',
    whatItIs:
      'Attention alone is order-blind ("dog bites man" looks the same as "man bites dog"). Positional Encoding injects word order, while FFN, Residual Connections, and LayerNorm stabilize deep stacks.',
    whyWeNeedIt:
      'Stacking 32 to 96 transformer blocks would explode or vanish gradients without Residuals + Pre-LayerNorm, and without positional signals the model cannot tell word order.',
    howItWorks: [
      'Positional Encoding adds order info: classic Transformers used Sinusoidal sine/cosine waves; GPT-2 used Learned embeddings; modern LLMs (LLaMA, Gemma) use RoPE (Rotary Position Embedding).',
      'Feed-Forward Network (FFN) applies a two-layer MLP with ReLU, GELU, or SwiGLU independently to each token to store factual knowledge.',
      'Residual Connection (x + Sublayer(x)) gives gradients a clean highway during training. Modern LLMs prefer Pre-LN (LayerNorm before Attention/FFN) over Post-LN for stable deep training.',
      'Three Architecture Families: Encoder-Only (BERT/RoBERTa/ALBERT — bidirectional reading for embeddings & classification), Decoder-Only (GPT/LLaMA/Claude — causal masked left-to-right generation), Encoder-Decoder (T5/BART — translation & summarization).',
    ],
    formulaOrSpec: 'Pre-LN Block: x\' = x + MultiHeadAttn(LN(x))  →  out = x\' + FFN(LN(x\'))',
    indianExample:
      'Use Encoder-Only (BERT/BGE embeddings) to search Indian GST policy PDFs; use Decoder-Only (LLaMA/GPT) to answer citizen queries in clear plain English; use Encoder-Decoder (T5/IndicTrans2) for English-to-Hindi/Tamil translation.',
    pros: [
      'Modular identical layers scale smoothly from 100M to 1T+ parameters.',
      'Causal masking in Decoder-Only models lets a single unified architecture solve chat, coding, and reasoning.',
    ],
    limitations: [
      'Absolute positional embeddings struggle beyond training context length (solved by RoPE + YaRN scaling).',
    ],
    whenToUse:
      'Pick Encoder-Only for fast search embeddings/classification; pick Decoder-Only for generation and agents.',
    keyTakeaways: [
      'Attention mixes information across tokens; FFN transforms information inside each token.',
      'Pre-LN trains much more reliably at high depth than original Post-LN.',
    ],
    interviewQa: [
      {
        q: 'What is the main difference between BERT (Encoder) and GPT (Decoder)?',
        a: 'BERT uses bidirectional self-attention (sees both left and right words) and trains via Masked Language Modeling—great for understanding/embeddings. GPT uses causal masking (only sees previous words) and trains via Next-Token Prediction—great for text generation.',
      },
      {
        q: 'Why did modern LLMs replace Post-LayerNorm with Pre-LayerNorm?',
        a: 'In Pre-LayerNorm, the residual skip path stays completely untouched by normalization, creating a clean gradient highway from output to input so 80+ layer models train stably without fragile warmup tuning.',
      },
    ],
  },
  {
    id: 'llm-tokenization-training',
    number: '03',
    title: 'Tokenization (BPE/WordPiece/SentencePiece) & LLM Training',
    category: 'Pre-Training Pipeline',
    whatItIs:
      'Tokenization splits raw text into frequent subword chunks (tokens) mapped to integer IDs, and Pre-Training teaches the model language by predicting masked or next tokens over trillions of tokens.',
    whyWeNeedIt:
      'Word-level vocabularies explode to millions of rare words and fail on typos, while character-level sequences become too long. Subword tokenization keeps vocabulary around 32k–128k while handling any unseen word cleanly.',
    howItWorks: [
      'BPE (Byte-Pair Encoding — GPT/LLaMA): Starts with characters/bytes and repeatedly merges the most frequent adjacent pair.',
      'WordPiece (BERT): Merges pairs that maximize language-model likelihood rather than raw frequency.',
      'SentencePiece (T5/Gemma/LLaMA): Treats spaces as normal symbols (▁), working seamlessly across Hindi, Tamil, and code without pre-splitting by whitespace.',
      'Training Objective: CLM (Causal Language Modeling — predict next token with Cross-Entropy Loss) or MLM (Masked Language Modeling — fill [MASK] blanks).',
      'Optimization: AdamW optimizer (decoupled weight decay) + Learning Rate Warmup followed by Cosine Decay + Mixed Precision (BF16).',
    ],
    formulaOrSpec: 'Cross-Entropy Loss = - (1/T) Σ log P(token_t | token_<t)   |   Perplexity = exp(Loss)',
    indianExample:
      'English words like "Bengaluru" or "scholarship" take 1–2 tokens, whereas poorly trained tokenizers split Hindi/Devanagari words into 5–8 tiny byte tokens—making multilingual API calls costlier unless SentencePiece/multilingual BPE is used.',
    pros: [
      'Zero "unknown token" crashes—even brand-new Indian startups or Hinglish words break into valid subwords.',
      'Cosine decay + AdamW keeps trillion-token training runs stable.',
    ],
    limitations: [
      'Tokenizers explain why LLMs sometimes fail simple character tasks like counting letters in a word.',
    ],
    whenToUse:
      'Understanding token counts directly controls your context window budget and API bill (billed per million input/output tokens).',
    keyTakeaways: [
      '1 token ≈ 0.75 English words (≈ 4 characters).',
      'Lower Perplexity means the model is less surprised by real human text.',
    ],
    interviewQa: [
      {
        q: 'Why do LLMs use AdamW with Warmup + Cosine Decay?',
        a: 'Early weights are random, so Warmup starts with a tiny learning rate to prevent exploding updates. Once stable, Cosine Decay smoothly lowers the learning rate so the model settles into a sharp, low-loss valley.',
      },
      {
        q: 'Why is BF16 preferred over FP16 during modern LLM pre-training?',
        a: 'BF16 keeps the same 8-bit exponent range as FP32, so large gradients almost never overflow to NaN without complex loss-scaling hacks.',
      },
    ],
  },
  {
    id: 'llm-finetuning-quantization',
    number: '04',
    title: 'Fine-Tuning (SFT, RLHF, LoRA, QLoRA) & Quantization',
    category: 'Post-Training & Adaptation',
    whatItIs:
      'Pre-training produces a base autocomplete engine. Post-training (SFT + RLHF/DPO) turns it into a helpful assistant, while LoRA/QLoRA and Quantization let you adapt and run big models on modest GPUs.',
    whyWeNeedIt:
      'Updating all 7B–70B weights (Full Fine-Tuning) needs massive GPU clusters and risks Catastrophic Forgetting. LoRA freezes the base model and trains tiny adapter matrices (<1% params) instead.',
    howItWorks: [
      'SFT (Supervised Fine-Tuning): Train on curated (Instruction → Ideal Answer) pairs so the model follows directions.',
      'RLHF / DPO: Align answers with human preferences (helpful, honest, safe) using ranked response pairs.',
      'LoRA (Low-Rank Adaptation): Freeze original weight matrix W and learn a small low-rank update ΔW = A × B (rank r = 8 or 16), cutting trainable parameters by 99%.',
      'QLoRA: Load the frozen base weights in 4-bit NormalFloat (NF4) quantization + train 16-bit LoRA adapters—letting a 7B/8B model fine-tune on a single free/cheap 16GB GPU!',
      'Quantization shrinks weights from FP16 (2 bytes/param) → INT8 (1 byte) → INT4 (0.5 byte), cutting VRAM ~4× with tiny quality drop.',
    ],
    formulaOrSpec: 'W_adapted = W_frozen + (α/r) · (B · A)   |   7B Model VRAM ≈ 14 GB (FP16) → 7 GB (INT8) → 4 GB (INT4)',
    indianExample:
      'A Pune EdTech startup fine-tunes Llama-3 8B on NCERT science Q&A using QLoRA on a single ₹40/hour cloud GPU instead of renting an 8×A100 cluster costing ₹25,000/day.',
    pros: [
      'LoRA adapters are tiny (50–150 MB) and can be hot-swapped per customer domain.',
      '4-bit quantization allows running capable 7B–8B LLMs even on an engineering student\'s laptop.',
    ],
    limitations: [
      'Fine-tuning teaches style/format/domain behavior—it is NOT a substitute for RAG when facts change daily.',
      'Aggressive 2-bit/3-bit quantization degrades coding and math reasoning accuracy.',
    ],
    whenToUse:
      'Use SFT/LoRA for strict output style, domain tone, or Indian regional language fluency; use RAG for live knowledge.',
    keyTakeaways: [
      'Rule of thumb for inference VRAM: FP16 ≈ 2× params (GB), INT4 ≈ 0.6× params (GB) plus KV Cache.',
      'Always try Prompt Engineering → RAG → LoRA Fine-Tuning in that exact order.',
    ],
    interviewQa: [
      {
        q: 'What is the difference between LoRA and QLoRA?',
        a: 'Both freeze the base model and train tiny low-rank adapter matrices A and B. QLoRA additionally quantizes the frozen base model to 4-bit (NF4) with double quantization, slashing GPU memory by ~70%.',
      },
      {
        q: 'Why does fine-tuning NOT solve up-to-date factual Q&A as well as RAG?',
        a: 'Fine-tuning updates statistical weights slowly and expensively, so new circulars or policy edits require another training run. RAG updates knowledge instantly by indexing new document chunks.',
      },
    ],
  },
  {
    id: 'llm-inference-kvcache',
    number: '05',
    title: 'LLM Inference, KV Cache, Decoding & Multimodal Models',
    category: 'Serving & Optimization',
    whatItIs:
      'Inference generates answers one token at a time (Prefill + Decode). KV Cache stores past Key/Value tensors so the model never recomputes previous tokens, cutting generation work from O(n²) to O(n).',
    whyWeNeedIt:
      'Without KV Cache, generating a 1,000-word reply would re-read the entire prompt 1,000 times. KV Cache + Continuous Batching + Speculative Decoding make production chat feel instant and affordable.',
    howItWorks: [
      'Prefill Phase (compute-bound): Processes your entire prompt in one parallel pass and fills the KV Cache.',
      'Decode Phase (memory-bandwidth-bound): Generates 1 new token per step, appending only the new token\'s K and V to the cache.',
      'Decoding Controls: Temperature (0 = deterministic factual, 0.7 = balanced, >1.0 = creative), Top-K (pick from top K tokens), Top-P / Nucleus (pick from smallest set summing to probability P), Beam Search (tracks top B full sequences).',
      'Serving Accelerators: Continuous Batching (vLLM/TGI slots new requests immediately as old ones finish) & Speculative Decoding (small fast draft model proposes 4 tokens, big model verifies all 4 in 1 pass).',
      'Multimodal Transformers: ViT (splits images into 16×16 patches as tokens), Whisper (audio Mel-spectrogram encoder-decoder for speech-to-text), CLIP (aligns image + text vectors in one shared embedding space).',
    ],
    formulaOrSpec: 'Without KV Cache: O(n²) per reply  →  With KV Cache: O(n) per reply   |   TTFT = Prefill latency',
    indianExample:
      'An IRCTC voice helpdesk uses Whisper (audio → Hindi/English text), routes to a quantized LLM served via vLLM with KV Cache + Temperature 0.1 for accurate PNR policy answers at <300ms Time-To-First-Token.',
    pros: [
      'KV Cache delivers 5×–20× faster token generation for long conversations.',
      'Speculative Decoding gives 2×–3× speedup with mathematically identical output distribution.',
    ],
    limitations: [
      'KV Cache grows linearly with batch size × context length and quickly fills GPU VRAM (solved by PagedAttention & GQA).',
    ],
    whenToUse:
      'Keep Temperature ≤ 0.2 for SQL/JSON/RAG factual answers; use Temperature 0.7–0.9 with Top-P 0.9 for brainstorming.',
    keyTakeaways: [
      'Track two core serving latencies: TTFT (Time to First Token) and TPOT (Time Per Output Token).',
      'ViT = Vision patches, Whisper = Speech-to-Text, CLIP = Text-Image shared search space.',
    ],
    interviewQa: [
      {
        q: 'Why does LLM decoding become memory-bandwidth bound instead of compute bound?',
        a: 'During decoding, the GPU must load billions of model weights from HBM VRAM just to produce 1 single token per request. The arithmetic is tiny compared to the memory transfer time.',
      },
      {
        q: 'How does PagedAttention (vLLM) solve GPU VRAM waste in serving?',
        a: 'Classic serving pre-allocates one giant contiguous VRAM block for every request\'s maximum context length, wasting 60%+ memory. PagedAttention splits KV Cache into small non-contiguous pages like OS virtual memory, boosting batch throughput 2×–4×.',
      },
    ],
  },
];

/* ========================================================================== */
/* TRACK 3: RAG, VECTOR DATABASES & SPRING AI (JAVA)                          */
/* ========================================================================== */

export const VECTOR_DB_COMPARISON: VectorDbComparisonRow[] = [
  {
    name: 'FAISS (Meta)',
    type: 'In-memory C++/Python Library',
    bestFor: 'Fast local research prototypes & static indexes',
    indexing: 'Flat, IVF, HNSW, PQ',
    indianUseCase: 'College capstone search over 50k PDF pages on one machine',
  },
  {
    name: 'ChromaDB',
    type: 'Lightweight Open-Source Vector DB',
    bestFor: 'Local dev, LangChain/Spring AI quickstarts',
    indexing: 'HNSW + Metadata filtering',
    indianUseCase: 'Quick RAG MVP for internal HR leave policy bot',
  },
  {
    name: 'PGVector (PostgreSQL)',
    type: 'Postgres Extension',
    bestFor: 'Teams already running PostgreSQL who want ACID + SQL + Vectors',
    indexing: 'IVFFlat, HNSW',
    indianUseCase: 'Spring Boot fintech app storing user rows & doc embeddings in 1 DB',
  },
  {
    name: 'Qdrant',
    type: 'Rust High-Performance Vector DB',
    bestFor: 'Low-latency production filtering + Hybrid dense/sparse search',
    indexing: 'HNSW + Scalar/Binary Quantization',
    indianUseCase: 'E-commerce semantic + filter search (Brand + Price < ₹2,000)',
  },
  {
    name: 'Pinecone',
    type: 'Fully Managed Serverless Cloud DB',
    bestFor: 'Zero-ops production scale without managing clusters',
    indexing: 'Proprietary serverless ANN',
    indianUseCase: 'SaaS startup scaling to 100M+ customer docs with a 2-person team',
  },
  {
    name: 'Weaviate / Milvus',
    type: 'Distributed Enterprise Vector DB',
    bestFor: 'Billion-scale multi-tenant hybrid search clusters',
    indexing: 'HNSW, DiskANN, IVF_PQ',
    indianUseCase: 'Enterprise telecom knowledge base across crores of tickets',
  },
];

export const RAG_AND_SPRING_AI_NOTES: PlainNoteSection[] = [
  {
    id: 'rag-end-to-end',
    number: '01',
    title: 'RAG End-to-End Pipeline & Vector Indexing (Flat, IVF, HNSW, PQ)',
    category: 'Retrieval-Augmented Generation',
    whatItIs:
      'RAG gives an LLM an "open-book exam": before answering, your app fetches the most relevant paragraphs from your private documents and pastes them into the prompt so the LLM answers from verified facts.',
    whyWeNeedIt:
      'LLMs have a knowledge cutoff, cannot see your private company PDFs/databases, and hallucinate confidently when unsure. RAG fixes all three without expensive retraining.',
    howItWorks: [
      '1. Ingestion & Chunking: Load PDFs/Docs and split into 300–800 token chunks with 10–20% overlap so sentences do not break mid-thought.',
      '2. Embedding: Convert every chunk into a dense numeric vector of 768 or 1536 floats so paragraphs with similar meanings sit close together in vector space.',
      '3. Vector Storage & Indexing: Store vectors + metadata in a Vector DB using Flat (100% exact brute-force, slow at scale), IVF (clusters vectors into buckets), HNSW (multi-layer highway graph — fast & accurate), or PQ (compresses vectors to save RAM).',
      '4. Query & Retrieval: Embed the user question and run Cosine Similarity search to pull the Top-K (typically 3 to 5) closest chunks.',
      '5. Grounded Generation: Inject those chunks into the system prompt with explicit rules to answer only from the provided context, cite the exact source page, and refuse clearly when evidence is absent.',
    ],
    formulaOrSpec: 'Cosine Similarity = (A · B) / (||A|| · ||B||)   |   Range: -1 (opposite) to +1 (identical meaning)',
    indianExample:
      'A company HR assistant reads the latest 2026 Indian Leave & Mediclaim PDF. When an employee asks "Can I carry forward earned leave?", RAG retrieves Section 4.2 verbatim and answers accurately with page citation.',
    pros: [
      'Update knowledge in seconds—just re-index the updated PDF, no retraining needed.',
      'Dramatically cuts hallucinations and provides auditable source citations.',
    ],
    limitations: [
      'Garbage chunks in = garbage answers out (bad PDF tables or tiny/huge chunk sizes break retrieval).',
    ],
    whenToUse:
      'Whenever your app answers questions over private, changing, or auditable documents (policies, legal, support, codebases).',
    keyTakeaways: [
      'Chunking quality decides 70% of RAG accuracy—prefer Recursive Character or Semantic Chunking with overlap.',
      'HNSW is the default production index for low-latency high-recall vector search.',
    ],
    interviewQa: [
      {
        q: 'When should you choose RAG vs Fine-Tuning vs Prompt Engineering?',
        a: 'Use Prompt Engineering first for simple tasks. Use RAG when the model needs external, private, or frequently updated facts. Use Fine-Tuning when the model needs a new speaking style, strict output schema, or deep domain reasoning patterns.',
      },
      {
        q: 'Why do RAG pipelines add 10% to 20% overlap between adjacent text chunks?',
        a: 'If a crucial policy condition starts at the end of Chunk 4 and finishes at the start of Chunk 5, overlap keeps the complete sentence intact inside at least one chunk so retrieval never cuts off the answer.',
      },
    ],
  },
  {
    id: 'rag-advanced-eval',
    number: '02',
    title: 'Advanced RAG (Hybrid Search, Reranking) & Evaluation (RAGAS)',
    category: 'Production RAG Patterns',
    whatItIs:
      'Naive vector search misses exact product codes, acronyms, and multi-hop queries. Advanced RAG adds Query Rewriting, Hybrid Search (BM25 + Vector), Metadata Filtering, and a Cross-Encoder Reranker.',
    whyWeNeedIt:
      'If a user searches "Error code UPI-91" or "Section 80C limit", pure semantic vectors may return generic tax paragraphs. Combining keyword search (BM25) with semantic vectors catches both exact IDs and conceptual meaning.',
    howItWorks: [
      'Query Transformation: Rewrite vague follow-ups ("What about its limit?") into standalone search queries using chat history, or generate HyDE (Hypothetical Document Embedding).',
      'Metadata Filtering (Self-Querying RAG): Filter by year=2026, department="HR", or region="India" BEFORE vector search to cut noise.',
      'Hybrid Search (BM25 + Dense Vector): Run lexical keyword search + semantic vector search in parallel and merge rankings via Reciprocal Rank Fusion (RRF).',
      'Cross-Encoder Reranking: Fetch Top-25 candidates cheaply, then pass them through a Cross-Encoder model such as BGE-Reranker or Cohere Rerank to pick the sharpest Top-5.',
      'Evaluation (RAGAS / TruLens / DeepEval): Measure 4 core scores — Context Precision, Context Recall, Faithfulness (did the LLM stick to context?), and Answer Relevance.',
    ],
    formulaOrSpec: 'RRF Score(d) = Σ 1 / (k + rank_i(d))   |   RAGAS Triad: Context Relevance · Faithfulness · Answer Relevance',
    indianExample:
      'In a B2B GST filing copilot, Hybrid Search finds exact HSN code "8471" via BM25 while Vector Search understands "laptop tax rate", and Reranking pushes the exact 2026 CBIC notification to #1.',
    pros: [
      'Hybrid Search + Reranking typically boosts retrieval precision by 15%–30% over Naive RAG.',
      'RAGAS catches silent regressions whenever you change chunk size or embedding models.',
    ],
    limitations: [
      'Each extra stage (query rewrite + rerank) adds 80–250ms latency, so budget latency carefully.',
    ],
    whenToUse:
      'Any production RAG system where exact IDs, legal clauses, or high factual accuracy matter.',
    keyTakeaways: [
      'Always evaluate Retrieval (Recall@K) separately from Generation (Faithfulness) so you know which half failed.',
      'Conversational RAG MUST condense follow-up questions with history before searching the Vector DB.',
    ],
    interviewQa: [
      {
        q: 'Why is a Cross-Encoder Reranker better than plain vector similarity, and why not use it on all documents?',
        a: 'Vector search embeds query and document separately (Bi-Encoder), missing fine word-to-word interactions. A Cross-Encoder reads query + document together for deep precision, but is too slow for 1M docs—so we run Bi-Encoder for Top-25, then Cross-Encoder for Top-5.',
      },
      {
        q: 'How does Reciprocal Rank Fusion (RRF) combine BM25 keyword scores with Cosine Similarity scores?',
        a: 'BM25 scores (unbounded) and Cosine scores (-1 to 1) live on incompatible scales. RRF ignores raw scores and sums `1 / (60 + rank)` from each list so documents ranked high by both systems rise cleanly to the top.',
      },
    ],
  },
  {
    id: 'spring-ai-complete',
    number: '03',
    title: 'Spring Boot + Spring AI (ChatClient, VectorStore, ChatMemory & RAG API)',
    category: 'Java Enterprise AI · New Topic',
    whatItIs:
      'Spring AI brings Spring Boot\'s familiar dependency-injection and clean abstractions (`ChatClient`, `EmbeddingModel`, `VectorStore`, `ChatMemory`) to Java backends—so Java/Spring developers can build production AI & RAG services without switching to Python.',
    whyWeNeedIt:
      'Most Indian enterprise banking, telecom, and e-commerce backends run on Java & Spring Boot. Spring AI lets you plug OpenAI, Gemini, Ollama, PGVector, or Chroma directly into existing microservices with type-safe DTOs and Spring Security.',
    howItWorks: [
      'ChatClient (Fluent API): Works like RestClient and WebClient by chaining `.prompt().system(rules).user(query).options(opts).call().content()` cleanly.',
      'Document ETL Pipeline: Load PDFs via `PagePdfDocumentReader` (or `TextReader`), split via `TokenTextSplitter` / recursive splitter, and write to `PgVectorStore` or `ChromaVectorStore` via `vectorStore.add(chunks)`.',
      'Retrieval with SearchRequest: Query vectors with `SearchRequest.builder().query(q).topK(3).similarityThreshold(0.75).build()` to filter out weak matches.',
      'PromptTemplate & Model Parameters: Control `temperature` (0.1 for factual RAG), `maxTokens`, `topP`, and inject retrieved context cleanly using `PromptTemplate`.',
      'ChatMemory & Advisors: Attach `MessageChatMemoryAdvisor` backed by `InMemoryChatMemory` (dev), Caffeine cache, or Redis (distributed multi-pod Spring Boot) keyed by `conversationId`.',
    ],
    formulaOrSpec: 'Spring Boot REST (/api/rag/ask) → VectorStore.similaritySearch(topK=3, threshold=0.75) → ChatClient + ChatMemory → Grounded Answer',
    indianExample:
      'An Indian bank\'s existing Spring Boot 3 microservice adds a `/api/rag/ask` endpoint backed by PostgreSQL + PGVector and Redis ChatMemory so branch managers can query RBI circular PDFs inside the existing Java app.',
    pros: [
      'Switch LLM providers (OpenAI ↔ Gemini ↔ local Ollama) via `application.yml` without rewriting Java business logic.',
      'Reuses your existing PostgreSQL (PGVector), Redis (ChatMemory), Spring Security, and Actuator metrics.',
    ],
    limitations: [
      'Cutting-edge research libraries still appear in Python first; keep heavy model training in Python and enterprise APIs/RAG in Spring AI.',
    ],
    whenToUse:
      'Whenever your production backend is Java/Spring Boot and you want clean, maintainable AI integration without maintaining a separate Python bridge for simple RAG/chat.',
    keyTakeaways: [
      'Always set a `similarityThreshold` between 0.70 and 0.75 in `SearchRequest` so irrelevant chunks do not pollute your prompt.',
      'Use Redis-backed `ChatMemory` in multi-instance Kubernetes deployments instead of `InMemoryChatMemory`.',
    ],
    interviewQa: [
      {
        q: 'How do you maintain multi-turn conversation history safely across 5 load-balanced Spring Boot pods?',
        a: 'Do not use InMemoryChatMemory because each pod has isolated RAM. Store conversation messages in Redis keyed by conversationId with a bounded 10-turn sliding window and TTL expiry.',
      },
      {
        q: 'What does similarityThreshold(0.75) do in Spring AI SearchRequest?',
        a: 'It drops retrieved chunks whose cosine similarity score falls below 0.75, preventing the LLM from receiving unrelated context and hallucinating.',
      },
    ],
    codeExample: {
      title: 'End-to-End Spring Boot + Spring AI RAG Service & REST Controller',
      language: 'java',
      contextHint: 'Spring AI ChatClient + PGVector SearchRequest + grounded PromptTemplate in Java.',
      code: `@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public RagController(ChatClient.Builder builder, VectorStore vectorStore) {
        this.chatClient = builder.build();
        this.vectorStore = vectorStore;
    }

    @PostMapping("/ask")
    public Map<String, Object> ask(@RequestBody Map<String, String> body) {
        String question = body.getOrDefault("question", "").trim();
        // 1. Retrieve Top-3 relevant chunks above 0.75 cosine similarity
        List<Document> docs = vectorStore.similaritySearch(
            SearchRequest.builder()
                .query(question)
                .topK(3)
                .similarityThreshold(0.75)
                .build()
        );
        String context = docs.stream()
            .map(Document::getText)
            .collect(Collectors.joining("\\n---\\n"));

        // 2. Call LLM with strict grounding and low temperature
        String answer = chatClient.prompt()
            .system("Answer ONLY using the provided context. If missing, say you do not know.")
            .user("Context:\\n" + context + "\\n\\nQuestion: " + question)
            .options(ChatOptions.builder().temperature(0.1).maxTokens(400).build())
            .call()
            .content();

        return Map.of("answer", answer, "sourcesUsed", docs.size());
    }
}`,
    },
  },
];

/* ========================================================================== */
/* TRACK 4: HARNESS ENGINEERING FOR PRODUCTION AI AGENTS (NEW MISSING TOPIC)  */
/* ========================================================================== */

export const HARNESS_LEH_TRIP_WORKFLOW: HarnessLehStep[] = [
  {
    step: 1,
    phase: 'Perceive',
    title: 'Capture User Goal & Constraints',
    harnessAction:
      'User asks: "Plan a 3-day Leh trip from Delhi next month under ₹50,000 total." Input guardrail checks prompt safety and extracts structured constraints (budget=₹50,000, days=3, origin=DEL, dest=IXL).',
    toolOrGuardrail: 'Input Guardrail + Schema Extractor',
    budgetOrMetric: 'Budget Cap: ₹50,000',
  },
  {
    step: 2,
    phase: 'Reason',
    title: 'Break Down Sub-Tasks & Risk Checks',
    harnessAction:
      'Agent reasons that Leh is high-altitude (3,500m → Day 1 needs acclimatization!) and total spend must cover return flights, 2-night hotel, local cab permits, and food within ₹50,000.',
    toolOrGuardrail: 'Working Memory Scratchpad + System Policy',
    budgetOrMetric: 'Tokens: ~420 · Cost: ₹0.06',
  },
  {
    step: 3,
    phase: 'Plan',
    title: 'Choose Parallel Tool Calls',
    harnessAction:
      'Orchestrator schedules `search_flights(DEL, IXL)` and `search_hotels(Leh, 2 nights)` in parallel instead of sequentially to save 1.4 seconds of wall-clock time.',
    toolOrGuardrail: 'Parallel Workflow Orchestrator',
    budgetOrMetric: 'Max Steps Allowed: 6',
  },
  {
    step: 4,
    phase: 'Act',
    title: 'Execute Validated Tool Calls',
    harnessAction:
      'Harness validates JSON arguments against tool schemas, runs read-only API calls with 5s timeout + retry, and blocks any payment/booking call without explicit human confirmation.',
    toolOrGuardrail: 'Tool Execution Sandbox + Timeout Guardrail',
    budgetOrMetric: 'Flights ₹18,400 · Hotel ₹11,200 · Local ₹9,500',
  },
  {
    step: 5,
    phase: 'Observe',
    title: 'Verify Budget Math & Context Compaction',
    harnessAction:
      'Tool outputs return 25 hotel options (noisy JSON). Context Compaction trims raw JSON down to top 3 rated hotels and runs deterministic calculator check: ₹18,400 + ₹11,200 + ₹9,500 + ₹4,500 food = ₹43,600 (₹6,400 buffer left!).',
    toolOrGuardrail: 'Context Compactor + Deterministic Budget Verifier',
    budgetOrMetric: 'Total: ₹43,600 ≤ ₹50,000 ✓',
  },
  {
    step: 6,
    phase: 'Iterate',
    title: 'Output Guardrail, Trace Log & Final Itinerary',
    harnessAction:
      'Output guardrail verifies no hallucinated flight numbers, checks acclimatization safety note for Day 1, emits OpenTelemetry/Langfuse trace (total cost ₹0.35), and returns the clean 3-day itinerary.',
    toolOrGuardrail: 'Output Guardrail + Langfuse / OTel Trace',
    budgetOrMetric: 'Latency: 3.1s · Trace Cost: ₹0.35',
  },
];

export const HARNESS_ENGINEERING_NOTES: PlainNoteSection[] = [
  {
    id: 'harness-model-vs-harness',
    number: '01',
    title: 'What is Harness Engineering? (Model vs Harness & 6 Core Components)',
    category: 'Agent Architecture · New Topic',
    whatItIs:
      'An LLM by itself is just a powerful engine sitting on a table. Harness Engineering is the complete "car" around the model—context management, tools, memory, orchestration, guardrails, observability, and evaluation—that makes an AI agent safe, reliable, and cost-effective in production.',
    whyWeNeedIt:
      'A raw LLM can write great code in a demo, then silently call the wrong API, burn ₹5,000 in an infinite loop, or leak customer PII in production. Most real-world agent failures are Harness bugs, not Model bugs.',
    howItWorks: [
      'Component 1 — Context Manager: Assembles system rules, retrieved facts, and compacted chat history without overflowing context limits.',
      'Component 2 — Tool Runtime: Exposes strict JSON-schema tools with timeouts, retries, and permission checks.',
      'Component 3 — Memory Layer: Separates Short-Term (current session), Working Memory (active plan/scratchpad), and Long-Term (user preferences & past runs in DB/Vector store).',
      'Component 4 — Orchestrator: Controls the execution loop (`Perceive → Reason → Plan → Act → Observe → Iterate`) and caps maximum steps/spend.',
      'Component 5 — Guardrails: Enforces 5 safety layers around inputs, tool execution, outputs, sensitive data, and system limits.',
      'Component 6 — Observability & Eval: Logs every prompt, tool payload, latency, token count, and cost per query so engineers can debug and regress-test changes.',
    ],
    formulaOrSpec: 'Production AI Agent = Foundation Model (Brain) + Engineering Harness (Steering, Brakes, GPS & Dashboard)',
    indianExample:
      'Think of a Maruti/Tata car: the engine (LLM) provides raw horsepower, but without brakes (guardrails), fuel gauge (token/cost tracking), steering (orchestration), and GPS (tools/RAG), you would never drive it on an Indian highway.',
    pros: [
      'Upgrading or swapping models becomes effortless because business reliability lives in the harness.',
      'Prevents runaway token bills, infinite tool loops, and unauthorized database writes.',
    ],
    limitations: [
      'Over-engineering a complex multi-agent harness for a simple single-prompt task adds latency and maintenance overhead.',
    ],
    whenToUse:
      'Every time an AI feature moves beyond a simple chat box to call tools, touch real user data, or execute multi-step workflows.',
    keyTakeaways: [
      'Start with the simplest workflow (Single LLM → Structured Workflow → Autonomous Agent) and only add autonomy when needed.',
      'Always enforce hard `max_steps`, `max_tokens`, and `timeout_ms` budgets in the harness.',
    ],
    interviewQa: [
      {
        q: 'Why do most demo AI agents fail when deployed to real users?',
        a: 'Demos only test the happy path with one prompt. Production exposes prompt injections, flaky third-party APIs, huge noisy tool responses that blow up context, infinite retry loops, and silent cost spikes—all of which require Harness Engineering.',
      },
      {
        q: 'When should you build a deterministic workflow instead of an autonomous agent loop?',
        a: 'Whenever the exact sequence of steps is already known ahead of time—such as KYC document verification or invoice extraction. Deterministic workflows are cheaper, faster, and easier to audit than open-ended agent loops.',
      },
    ],
  },
  {
    id: 'harness-context-tools-memory',
    number: '02',
    title: 'Context Engineering, Compaction, Tool Schemas & Memory Types',
    category: 'Core Mechanics',
    whatItIs:
      'Context Engineering is the craft of feeding the LLM the smallest, cleanest, highest-signal set of instructions, memory, and tool outputs at every turn.',
    whyWeNeedIt:
      'Even if a model supports 200k tokens, stuffing raw 50KB JSON API dumps causes "context rot" (the model misses key constraints buried in the middle) and multiplies latency and cost.',
    howItWorks: [
      'Context Compaction: Summarize older conversation turns, strip useless fields from tool JSON responses, and keep active constraints pinned near the top/bottom.',
      'Tool Engineering: Write crystal-clear tool names, descriptions, strict JSON Schemas (types, enums, required fields), and return clean error messages the agent can recover from.',
      'Short-Term Memory: Current conversation turns stored in session state/Redis.',
      'Working Memory: Explicit scratchpad/plan state (current step, budget spent so far, pending checklist).',
      'Long-Term Memory: Durable facts stored across sessions, such as knowing that a traveler prefers vegetarian meals and window seats, retrieved only when relevant.',
    ],
    formulaOrSpec: 'Good Tool Contract = Strict JSON Schema + Idempotent Execution + Concise Return Payload + Clear Recovery Error',
    indianExample:
      'When a flight search tool returns 120 IndiGo/Air India options (90 KB JSON), the harness compacts it to the top 5 options under ₹20,000 before passing it back to the LLM—saving 85% tokens.',
    pros: [
      'Cuts token cost by 50%–80% while actually improving reasoning accuracy.',
      'Clear tool schemas eliminate malformed function arguments.',
    ],
    limitations: [
      'Over-aggressive summarization can accidentally drop critical constraints like a user\'s exact budget or date.',
    ],
    whenToUse:
      'In every multi-turn or tool-calling agent where conversations exceed 5 turns or APIs return bulky payloads.',
    keyTakeaways: [
      'Never dump raw database/API payloads straight into the prompt—filter and project only needed fields.',
      'Never ask an LLM to do mental arithmetic for money; give it a deterministic calculator/budget checker tool.',
    ],
    interviewQa: [
      {
        q: 'What is Context Compaction and when should a harness trigger it?',
        a: 'Context Compaction summarizes old dialogue and prunes bulky past tool results once token usage crosses a fixed threshold such as 60% of the context budget, preserving exact constraints and active goals while keeping prompts fast and cheap.',
      },
      {
        q: 'Why should an agent tool return a structured error message instead of crashing on bad arguments?',
        a: 'A clear error such as `{"error": "date must be YYYY-MM-DD, received 12/05/26"}` lets the model self-correct on the next turn inside the harness loop instead of failing the user request outright.',
      },
    ],
  },
  {
    id: 'harness-orchestration-guardrails',
    number: '03',
    title: 'Orchestration Patterns & The 5 Guardrail Layers',
    category: 'Control & Safety',
    whatItIs:
      'Orchestration defines how agent steps execute (Sequential, Parallel, Conditional, Loop, Multi-Agent), while the 5 Guardrail Layers block unsafe prompts, dangerous actions, and bad outputs.',
    whyWeNeedIt:
      'Predictable orchestration keeps latency low, and defense-in-depth guardrails guarantee that even if the model gets tricked, your database and users stay completely protected.',
    howItWorks: [
      '5 Orchestration Workflows: Sequential (A→B→C), Parallel (run flight + hotel tools together), Conditional Router (simple FAQ → fast small model, complex refund → strong model), Evaluator-Optimizer Loop (draft → check → fix up to N retries), Multi-Agent Supervisor (Planner delegates to Specialist workers).',
      'Layer 1 — Input Guardrails: Detect prompt injection, jailbreaks, toxic inputs, and off-topic requests before hitting the LLM.',
      'Layer 2 — Execution Guardrails: Enforce read-only vs write permissions, Human-in-the-Loop approval for payments/deletes, tool timeouts, and max-step circuit breakers.',
      'Layer 3 — Output Guardrails: Validate JSON schema, check groundedness against retrieved sources, and block hallucinated links/prices.',
      'Layer 4 — Data / Privacy Guardrails: Mask Aadhaar, PAN, phone numbers, and card digits (PII redaction) before sending prompts externally.',
      'Layer 5 — System Guardrails: Per-user rate limits, daily ₹/USD spend caps, and fallback model routing when an API is down.',
    ],
    formulaOrSpec: 'Defense in Depth: Input Filter → PII Redaction → Tool Policy + HITL → Output Verifier → Spend Cap',
    indianExample:
      'A fintech support agent can freely read UPI transaction status (read-only tool), masks the customer\'s mobile/account number before logging, and strictly requires human OTP approval before triggering any refund.',
    pros: [
      'Deterministic code enforces security—you never rely on "please don\'t leak data" inside a prompt alone.',
      'Parallel orchestration cuts multi-tool response times by 40%–60%.',
    ],
    limitations: [
      'Heavy LLM-based guardrails on every step add latency; prefer fast regex/rule/classifier checks first.',
    ],
    whenToUse:
      'Mandatory for any customer-facing or write-capable agent in fintech, healthcare, e-commerce, or enterprise IT.',
    keyTakeaways: [
      'Always use Human-in-the-Loop (HITL) before irreversible actions (payments, emails, DB deletes).',
      'Prefer deterministic workflow orchestration over free-form multi-agent swarms unless open-ended exploration is truly required.',
    ],
    interviewQa: [
      {
        q: 'Why is prompt-only safety ("Do not reveal secrets") insufficient for production agents?',
        a: 'LLMs treat system instructions and user input in the same token stream and can be social-engineered. Real safety must be enforced in deterministic harness code: RBAC tool permissions, PII redaction, and schema validation.',
      },
      {
        q: 'How do you stop a runaway agent loop from burning thousands of rupees on API calls?',
        a: 'Enforce hard system guardrails in the harness: cap `max_steps` (for example 6 turns), cap total tokens per session, set per-user rate limits, and abort immediately if identical tool calls repeat twice in a row.',
      },
    ],
  },
  {
    id: 'harness-observability-eval',
    number: '04',
    title: 'Observability (Traces, Cost per Query) & 5-Level Agent Evaluation',
    category: 'Monitoring & Testing',
    whatItIs:
      'Observability records every thought, tool call, latency spike, and rupee spent per request (Logs, Metrics, Traces, Alerts), while 5-Level Evaluation tests your agent systematically before every release.',
    whyWeNeedIt:
      'Agents are non-deterministic. Without traces (Langfuse, Arize Phoenix, OpenTelemetry) and automated eval suites, changing one sentence in a system prompt can silently break 20% of customer queries.',
    howItWorks: [
      '4 Pillars of Agent Observability: Structured Logs (events), Metrics (p95 latency, tool failure rate, ₹0.35/query avg cost), Distributed Traces (parent span → LLM span → tool spans), and Alerts (cost spike or hallucination jump).',
      'Level 1 — Unit Tests: Test every tool wrapper, JSON parser, PII masker, and budget math deterministically (no LLM needed).',
      'Level 2 — Integration Tests: Verify tool schemas, retry/timeout handling, and Vector DB filters against staging stubs.',
      'Level 3 — End-to-End Golden Dataset Eval: Run 50–200 real user scenarios (like the Leh ₹50,000 trip) and score tool selection + final answer quality (LLM-as-a-Judge + deterministic checks).',
      'Level 4 — Regression Suite: Run automatically in CI/CD whenever prompts, chunking, or models change.',
      'Level 5 — Adversarial / Red-Team Tests: Attack your own agent with prompt injections, fake refunds, and over-budget edge cases.',
    ],
    formulaOrSpec: 'Target Telemetry: Latency p95 < 4s · Tool Success > 99% · Cost ≈ ₹0.35/query · Faithfulness ≥ 0.92',
    indianExample:
      'An EdTech doubt-solver tracks per-query cost in Langfuse: moving FAQ routing to a small model and caching NCERT lookups dropped average query cost from ₹1.80 down to ₹0.35—saving ₹14.5 Lakhs/month at 10 lakh queries.',
    pros: [
      'Turns "vibes-based prompting" into measurable software engineering.',
      'Distributed traces pinpoint in 10 seconds whether a slow response was caused by the LLM, Vector DB, or a flaky external API.',
    ],
    limitations: [
      'LLM-as-a-Judge can have bias—always anchor scores with deterministic checks (budget math, valid JSON, tool call match) and periodic human review.',
    ],
    whenToUse:
      'Set up OpenTelemetry/Langfuse tracing on Day 1 and build a 30-case golden eval suite before launching to users.',
    keyTakeaways: [
      'Measure cost per successful task completion, not just cost per token.',
      'Never ship a prompt or model upgrade without running your golden regression suite.',
    ],
    interviewQa: [
      {
        q: 'How do you test a non-deterministic AI agent in CI/CD?',
        a: 'Split tests cleanly: test tools, schemas, and guardrails with 100% deterministic unit tests; run a curated golden dataset of end-to-end scenarios scoring deterministic assertions (valid JSON, budget ≤ limit, right tool invoked) plus LLM-as-a-Judge rubric thresholds.',
      },
      {
        q: 'Why should teams track Cost per Completed Task instead of only Cost per 1M Tokens?',
        a: 'A cheaper model that fails tool calls twice and retries 4 times can end up costing more rupees per resolved customer ticket than a stronger model that succeeds cleanly on the first attempt.',
      },
    ],
  },
];

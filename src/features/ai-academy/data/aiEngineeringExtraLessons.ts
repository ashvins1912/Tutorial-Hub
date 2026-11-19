import type { AcademyModule } from './aiEngineeringCurriculum';

export const AI_ENGINEERING_EXTRA_MODULES: Record<string, AcademyModule[]> = {
  foundations: [{
    id: 'engineering-foundations',
    title: 'Software engineering for ML practitioners',
    outcome: 'Write testable Python, query datasets and engineer leakage-safe features.',
    lessons: [
      {
        id:'python-functions-tests',title:'Python functions, typing and unit tests',level:'Beginner',duration:'55 min',
        why:'AI prototypes become production services. Small, typed, testable functions make data transformations easier to debug and reuse.',
        analogy:'A function is a small machine with a defined input slot and output tray. A unit test checks the machine with known sample parts before it joins a factory line.',
        explanation:'Keep pure transformations separate from file, network and database I/O. Use type hints to communicate contracts, raise clear exceptions for invalid inputs and write unit tests for normal, boundary and invalid cases. Deterministic functions are easier to test and cache.',
        keyPoints:['One function should have one clear responsibility.','Type hints document intent but do not validate all runtime inputs.','Test empty input, boundary values and malformed records.','Avoid hidden global state in reusable preprocessing functions.'],
        workedExample:'A normalize_price function should reject negative prices, preserve zero as valid and return a consistent numeric type. Tests should cover 0, 100, -1 and None.',
        code:'def normalize_price(value: float) -> float:\n    if value < 0:\n        raise ValueError("price must be non-negative")\n    return round(float(value), 2)\n\ndef test_normalize_price():\n    assert normalize_price(10) == 10.0\n    assert normalize_price(0) == 0.0\n    try:\n        normalize_price(-1)\n        raise AssertionError("negative price should fail")\n    except ValueError:\n        pass',
        steps:[{title:'Define contract',detail:'Specify accepted inputs, outputs and failure behavior.',input:'Business rule',output:'Function signature and validation',failure:'Ambiguous handling of missing or invalid values.'},{title:'Implement pure transform',detail:'Keep deterministic logic separate from I/O.',input:'Validated value',output:'Normalized value',failure:'Hidden global state or mutation.'},{title:'Test boundaries',detail:'Test valid, empty, boundary and invalid inputs.',input:'Known test cases',output:'Repeatable verification',failure:'Only testing the happy path.'}],
        question:{prompt:'Which test case is most important in addition to a normal valid input?',options:['Only a larger happy-path value','Boundary and invalid inputs such as zero, negative and missing values','A random screenshot','Changing the production database'],answer:1,explanation:'Boundary and invalid cases expose assumptions that often break data pipelines.'},
        project:'Write a reusable CSV row validator with type hints and unit tests for missing columns, invalid numbers, negative values and duplicate IDs.',
        pitfalls:['Assuming type hints enforce runtime validation.','Mixing database calls into pure transformations.','Testing only one successful example.'],next:'SQL for analytical datasets'
      },
      {
        id:'sql-for-ml',title:'SQL for analytical datasets and feature extraction',level:'Beginner',duration:'60 min',
        why:'Most business data lives in relational tables. ML engineers need reliable joins, aggregations and time-bounded feature queries.',
        analogy:'A join is matching customer cards across separate filing cabinets. A group-by is collecting all transactions for each customer and calculating a summary.',
        explanation:'Use SELECT to choose columns, WHERE to filter rows, JOIN to combine related entities and GROUP BY to aggregate. Window functions calculate per-row context such as previous purchases. For predictive tasks, every feature must be computed using information available at prediction time.',
        keyPoints:['Use explicit join keys and inspect row counts after joins.','GROUP BY changes row granularity.','Window functions preserve rows while adding analytical context.','Avoid future leakage by applying event-time cutoffs.'],
        workedExample:'For churn prediction on 1 June, aggregate orders where created_at is earlier than 1 June. Including a cancellation event from 10 June leaks the future label into the feature set.',
        code:'SELECT customer_id,\n       COUNT(*) AS orders_90d,\n       SUM(total_amount) AS spend_90d,\n       MAX(created_at) AS last_order_at\nFROM orders\nWHERE created_at >= :cutoff - INTERVAL \'90 days\'\n  AND created_at < :cutoff\nGROUP BY customer_id;',
        steps:[{title:'Define prediction time',detail:'Choose the timestamp when the prediction would be made.',input:'Business question',output:'Feature cutoff',failure:'Unclear prediction horizon.'},{title:'Join and aggregate',detail:'Combine source tables and calculate features.',input:'Normalized source tables',output:'One row per entity',failure:'Many-to-many joins duplicate counts.'},{title:'Audit leakage',detail:'Verify every feature existed before the cutoff.',input:'Feature query',output:'Time-safe feature table',failure:'Future events included in historical features.'}],
        question:{prompt:'A model predicts churn on 1 June. Which event should not be used as a feature?',options:['Orders placed in May','Support tickets opened in April','A cancellation recorded on 10 June','Customer signup date'],answer:2,explanation:'The cancellation occurs after the prediction time and leaks future information.'},
        project:'Create a customer-level feature query with order count, spend, recency and support-ticket count using a fixed historical cutoff. Verify row count and no future timestamps.',
        pitfalls:['Join fan-out inflating aggregates.','Using labels or future events as features.','Forgetting time zones and inclusive/exclusive boundaries.'],next:'Feature engineering and leakage-safe pipelines'
      },
      {
        id:'feature-engineering',title:'Feature engineering and leakage-safe pipelines',level:'Intermediate',duration:'65 min',
        why:'Good features express useful domain signals. Poor feature definitions create leakage, brittle inference and misleading validation scores.',
        analogy:'A model is a learner; features are the notes you give it. Better notes summarize relevant evidence without revealing the answer key.',
        explanation:'Create numeric, categorical, temporal and interaction features using domain knowledge. Fit learned transformations only on training folds. Keep a single preprocessing pipeline shared by training and inference. Track feature definitions and schema versions.',
        keyPoints:['Feature engineering must respect prediction time.','Fit encoders and scalers on training folds only.','Handle unseen categories explicitly.','Feature importance is diagnostic, not causal proof.'],
        workedExample:'For order-risk prediction, order_value divided by a customer historical median can be useful, but that median must be computed from orders before the current order timestamp.',
        code:'from sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\n\nnumeric = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())])\ncategorical = Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("encode", OneHotEncoder(handle_unknown="ignore"))])\npreprocess = ColumnTransformer([("num", numeric, numeric_cols), ("cat", categorical, categorical_cols)])',
        steps:[{title:'Define feature meaning',detail:'Document formula, units and availability time.',input:'Raw business fields',output:'Feature contract',failure:'Feature is not available at inference.'},{title:'Build transformations',detail:'Apply encoding, scaling and domain-derived formulas.',input:'Training records',output:'Feature matrix',failure:'Unseen categories or invalid units.'},{title:'Validate pipeline',detail:'Fit within training folds and reuse for inference.',input:'Train/validation splits',output:'Leakage-safe fitted pipeline',failure:'Preprocessing fitted on all data.'}],
        question:{prompt:'Where should a learned categorical encoder be fitted during cross-validation?',options:['Before splitting the full dataset','Inside the pipeline so each training fold fits its own encoder','Only on the final test fold','On production requests independently'],answer:1,explanation:'Each fold must learn preprocessing from its training subset only.'},
        project:'Build a reusable preprocessing pipeline for mixed numeric and categorical data. Add tests for unseen categories, missing values and train/test leakage.',
        pitfalls:['Computing target-derived features from future data.','Different training and inference preprocessing.','Silently changing units or feature meanings.'],next:'Classical ML algorithm selection'
      }
    ]
  }],
  'classical-ml': [{
    id:'algorithm-selection',
    title:'Algorithm selection and evaluation',
    outcome:'Choose classification algorithms and metrics that fit the cost of mistakes.',
    lessons:[
      {
        id:'svm-naive-bayes',title:'Support Vector Machines and Naive Bayes',level:'Intermediate',duration:'65 min',
        why:'Different algorithms encode different assumptions. SVMs seek separating margins; Naive Bayes uses conditional probability with a simplifying independence assumption.',
        analogy:'An SVM draws a road between two groups while maximizing the road edges. Naive Bayes weighs clues such as words in a message to estimate which category is more likely.',
        explanation:'A linear SVM finds a decision boundary with a large margin; kernels can represent nonlinear boundaries. Naive Bayes applies Bayes theorem and assumes features are conditionally independent given the class. Both can be useful baselines, especially for text classification.',
        keyPoints:['SVMs are sensitive to feature scaling.','C controls the margin/error trade-off.','Naive Bayes can work well with sparse word-count features.','Independence is an assumption, not a claim that features truly are independent.'],
        workedExample:'In spam detection, a word-count vector feeds Multinomial Naive Bayes. For dense numeric features, a scaled SVM may be a useful comparison.',
        code:'from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import SVC\nfrom sklearn.naive_bayes import MultinomialNB\n\nsvm = make_pipeline(StandardScaler(), SVC(C=1.0, probability=True))\nnb = MultinomialNB(alpha=0.5)  # use non-negative count features',
        steps:[{title:'Inspect feature type',detail:'Check sparsity, scale and value domain.',input:'Feature matrix',output:'Algorithm constraints',failure:'Negative values passed to MultinomialNB.'},{title:'Fit candidate models',detail:'Train SVM and Naive Bayes with suitable preprocessing.',input:'Training split',output:'Candidate classifiers',failure:'Unscaled SVM features or incompatible inputs.'},{title:'Compare generalization',detail:'Evaluate on identical stratified folds.',input:'Validation predictions',output:'Precision/recall and latency comparison',failure:'Comparing models on different splits.'}],
        question:{prompt:'Which statement about Multinomial Naive Bayes is correct?',options:['It requires negative-valued features','It is commonly used with non-negative word counts or frequencies','It always outperforms Transformers','It does not use probabilities'],answer:1,explanation:'Multinomial Naive Bayes is a classic baseline for non-negative count/frequency features such as bag-of-words.'},
        project:'Train SVM and Multinomial Naive Bayes on a small text classification dataset. Compare preprocessing, precision, recall, training time and inference time.',
        pitfalls:['Using MultinomialNB with negative standardized values.','Skipping scaling for SVM.','Treating model assumptions as guaranteed properties of the data.'],next:'Metrics, calibration and threshold selection'
      },
      {
        id:'metrics-calibration',title:'Confusion matrices, PR-AUC and probability calibration',level:'Intermediate',duration:'70 min',
        why:'A model score is not a product decision. Metrics reveal which errors happen, and calibration tests whether predicted probabilities match observed frequencies.',
        analogy:'A smoke alarm should be judged by missed fires and false alarms, not by the percentage of quiet minutes when it correctly stays silent.',
        explanation:'A confusion matrix counts true positives, false positives, true negatives and false negatives. Precision and recall expose positive-class behavior. ROC-AUC measures ranking across thresholds; PR-AUC is often more informative for rare positives. Calibration evaluates probability reliability using reliability curves or Brier score.',
        keyPoints:['Choose metrics based on the cost of false positives and false negatives.','PR-AUC is useful when positive cases are rare.','Tune thresholds on validation data, not the final test set.','A ranking score is not necessarily a calibrated probability.'],
        workedExample:'If only 1 in 1,000 transactions is fraud, 99.9% accuracy can be achieved by predicting every transaction as legitimate. Recall and precision expose that failure.',
        code:'from sklearn.metrics import confusion_matrix, average_precision_score, brier_score_loss\n\nprob = model.predict_proba(X_test)[:, 1]\npred = (prob >= 0.20).astype(int)\nprint(confusion_matrix(y_test, pred))\nprint("PR-AUC", average_precision_score(y_test, prob))\nprint("Brier", brier_score_loss(y_test, prob))',
        steps:[{title:'Define error costs',detail:'Decide which mistakes matter most.',input:'Product risk and constraints',output:'Primary metric and guardrails',failure:'Optimizing accuracy despite class imbalance.'},{title:'Measure ranking',detail:'Evaluate PR-AUC or ROC-AUC across thresholds.',input:'Scores and labels',output:'Ranking metrics',failure:'Comparing metrics from different populations.'},{title:'Calibrate and choose threshold',detail:'Check probability reliability and select operating point.',input:'Validation scores',output:'Threshold policy',failure:'Threshold tuned on test data.'}],
        question:{prompt:'For a very rare positive class, which metric is often more informative than accuracy?',options:['PR-AUC','Number of model layers','Training duration only','Dataset filename'],answer:0,explanation:'Precision-recall metrics focus on the positive class and expose false-alarm/miss trade-offs.'},
        project:'Create an evaluation report for an imbalanced classifier with confusion matrix, PR curve, threshold comparison and probability calibration.',
        pitfalls:['Reporting only accuracy.','Confusing ROC-AUC with precision.','Using test-set feedback repeatedly to tune the model.'],next:'Time-series forecasting and temporal validation'
      }
    ]
  }],
  'deep-learning': [{
    id:'specialized-networks',
    title:'Specialized neural network training',
    outcome:'Reuse pretrained models and understand sequence-learning trade-offs.',
    lessons:[
      {
        id:'transfer-learning',title:'Transfer learning and fine-tuning vision models',level:'Intermediate',duration:'70 min',
        why:'Training a deep network from scratch can require huge datasets and compute. Transfer learning reuses features learned from a large source dataset.',
        analogy:'A new chef does not relearn knife skills from zero; they reuse existing skills and learn the cuisine-specific details.',
        explanation:'Load a pretrained backbone, replace its task-specific head, freeze some layers and train the new head. Then optionally unfreeze later blocks with a smaller learning rate. Use augmentations that preserve labels and evaluate on a held-out set.',
        keyPoints:['Pretrained weights encode reusable representations.','Freeze the backbone initially to reduce trainable parameters.','Fine-tune carefully with lower learning rates.','Check source/target domain mismatch and data licensing.'],
        workedExample:'For a small plant-disease dataset, replace the final classifier of a pretrained image model with the number of plant classes, train the head, then unfreeze the last backbone block.',
        code:'for parameter in model.backbone.parameters():\n    parameter.requires_grad = False\n\nmodel.classifier = nn.Linear(backbone_features, num_classes)\noptimizer = torch.optim.AdamW(model.classifier.parameters(), lr=1e-3)\n# After head convergence, unfreeze selected backbone blocks and lower the LR.',
        steps:[{title:'Choose pretrained model',detail:'Select architecture, weights and compatible input preprocessing.',input:'Target task and dataset',output:'Pretrained backbone',failure:'Incorrect normalization or incompatible labels.'},{title:'Train new head',detail:'Freeze backbone and learn target classes.',input:'Backbone features',output:'Task-specific classifier',failure:'Head overfits a tiny dataset.'},{title:'Fine-tune',detail:'Unfreeze selected layers with a smaller learning rate.',input:'Initialized classifier',output:'Adapted model',failure:'Large learning rate destroys useful pretrained features.'}],
        question:{prompt:'Why often freeze a pretrained backbone at the beginning?',options:['To remove the output layer permanently','To train a new task head with fewer trainable parameters and reduce overfitting risk','To make labels unnecessary','To guarantee 100% accuracy'],answer:1,explanation:'Freezing reduces trainable parameters and lets the new head adapt before changing pretrained features.'},
        project:'Fine-tune a pretrained image classifier on a small labelled dataset. Compare frozen-backbone and partial fine-tuning results and report memory use.',
        pitfalls:['Using incompatible preprocessing for pretrained weights.','Unfreezing all layers with an excessive learning rate.','Ignoring dataset and weight licensing.'],next:'Sequence models and temporal data'
      },
      {
        id:'sequence-models',title:'RNNs, LSTMs and sequence modelling',level:'Intermediate',duration:'65 min',
        why:'Some data has order and temporal dependencies: sensor readings, text and event streams. Sequence models process information across steps.',
        analogy:'An RNN reads a story one sentence at a time and carries a summary forward. An LSTM adds gates that decide what to remember and forget.',
        explanation:'A recurrent neural network updates a hidden state at each time step. Vanilla RNNs can struggle with long-range dependencies due to vanishing/exploding gradients. LSTMs use input, forget and output gates plus a cell state. Transformers instead use attention to connect positions directly.',
        keyPoints:['Sequence order is part of the input meaning.','Hidden state carries information between time steps.','LSTM gates regulate information flow.','Use temporal splits to avoid future leakage.'],
        workedExample:'For a daily demand forecast, feed the previous 30 days of demand and calendar features to predict the next day. Split by time, not randomly.',
        code:'import torch.nn as nn\n\nmodel = nn.LSTM(\n    input_size=num_features,\n    hidden_size=64,\n    num_layers=2,\n    batch_first=True,\n    dropout=0.1\n)\nsequence_output, (hidden, cell) = model(batch)\nnext_value = head(sequence_output[:, -1, :])',
        steps:[{title:'Window time series',detail:'Create ordered input windows and future targets.',input:'Timestamped observations',output:'[batch, time, features]',failure:'Random shuffle before time split.'},{title:'Update hidden state',detail:'Process each time step and carry state forward.',input:'Sequence tensor',output:'Hidden and cell states',failure:'Incorrect sequence lengths or padding.'},{title:'Predict horizon',detail:'Map final representation to future value/class.',input:'Sequence representation',output:'Forecast',failure:'Target horizon mismatch or leakage.'}],
        question:{prompt:'What is the main role of LSTM gates?',options:['To sort the dataset alphabetically','To regulate what information is retained, forgotten and exposed','To convert images to CSV','To guarantee no overfitting'],answer:1,explanation:'LSTM gates control information flow through the cell state and hidden state.'},
        project:'Create a time-ordered demand forecasting dataset with rolling windows. Compare a naive last-value baseline, an LSTM and a time-aware validation split.',
        pitfalls:['Random train/test split for time series.','Mixing future values into rolling features.','Ignoring a simple seasonal or last-value baseline.'],next:'Generative AI and foundation model adaptation'
      }
    ]
  }],
  genai: [{
    id:'foundation-model-engineering',
    title:'Foundation model engineering',
    outcome:'Choose between retrieval, fine-tuning and vector search based on the problem.',
    lessons:[
      {
        id:'vector-databases-embeddings',title:'Embedding models, vector databases and hybrid search',level:'Intermediate',duration:'75 min',
        why:'RAG quality depends on finding relevant evidence. Embeddings and vector indexes support semantic retrieval, while keyword search catches exact terms and identifiers.',
        analogy:'Keyword search finds the exact phrase in a catalogue. Vector search finds books about a similar idea even when they use different words.',
        explanation:'An embedding model maps text into a vector space. A vector database indexes those vectors and supports nearest-neighbour search. Cosine similarity compares direction. Hybrid search combines lexical and semantic retrieval; metadata filters constrain the candidate set before ranking.',
        keyPoints:['Use compatible query and document embedding models.','Chunk boundaries and metadata affect retrieval quality.','Hybrid search helps with exact product IDs, names and semantic questions.','Tenant and document ACL filters must be enforced before results reach the model.'],
        workedExample:'A query "refund after damaged delivery" may retrieve a policy chunk saying "items received in defective condition". Semantic search connects related phrasing; keyword search helps when a user enters policy code REF-204.',
        code:'# Conceptual hybrid retrieval\nvector_hits = vector_index.search(query_embedding, top_k=30, filter=authorized_scope)\nkeyword_hits = bm25.search(query_text, top_k=30, filter=authorized_scope)\nranked = reciprocal_rank_fusion(vector_hits, keyword_hits)\nfinal_context = reranker.rank(query_text, ranked)[:6]',
        steps:[{title:'Embed query',detail:'Use the same embedding family used for indexed documents.',input:'User question',output:'Query vector',failure:'Model/version mismatch.'},{title:'Retrieve candidates',detail:'Run vector and keyword retrieval with authorization filters.',input:'Query vector and text',output:'Candidate chunks',failure:'Missing metadata filter or low recall.'},{title:'Fuse and rerank',detail:'Combine candidate lists and score relevance.',input:'Candidate sets',output:'Ranked evidence',failure:'Duplicate chunks or excessive reranking latency.'}],
        question:{prompt:'Why combine keyword search with vector search in some RAG systems?',options:['To remove authorization','To capture both exact lexical matches and semantic similarity','To make embeddings unnecessary','To guarantee every answer is correct'],answer:1,explanation:'Hybrid retrieval can improve recall for exact terms and semantically related language.'},
        project:'Build a small hybrid search benchmark with at least 20 questions, expected source chunks, Recall@5 and an authorization filter test.',
        pitfalls:['Searching all tenants and filtering only in the UI.','Changing embedding model without reindexing.','Assuming nearest vector always means relevant evidence.'],next:'Fine-tuning versus RAG'
      },
      {
        id:'fine-tuning-vs-rag',title:'Fine-tuning versus RAG versus prompt engineering',level:'Advanced',duration:'70 min',
        why:'Teams often fine-tune a model when the real need is retrieval, or build a RAG system when the need is consistent output behavior. Choosing the right adaptation saves cost and complexity.',
        analogy:'Prompting gives a worker clear instructions. RAG gives them the latest reference manual. Fine-tuning trains them to perform a task in a more consistent way.',
        explanation:'Prompt engineering changes task instructions and examples at inference time. RAG supplies external, updateable evidence. Fine-tuning updates model parameters using curated examples. Fine-tuning is not a reliable way to store frequently changing facts; RAG is usually better for private and current knowledge.',
        keyPoints:['Use prompting first for simple behavior and formatting changes.','Use RAG for changing, private or citation-required knowledge.','Use fine-tuning for repeated task patterns, style or domain behavior when evaluation supports it.','Fine-tuning needs high-quality data, compute and regression testing.'],
        workedExample:'A support bot answering current return policies needs RAG. A model that must consistently classify support messages into a fixed taxonomy may benefit from fine-tuning after a prompt baseline is measured.',
        code:'# Decision checklist\nif knowledge_changes_frequently or citations_required:\n    choose = "RAG"\nelif task_behavior_is_repetitive and curated_examples_available:\n    evaluate = "fine-tuning against a prompt baseline"\nelse:\n    choose = "prompting + structured output validation"',
        steps:[{title:'Identify failure',detail:'Separate missing knowledge from inconsistent behavior.',input:'Observed model failures',output:'Root-cause category',failure:'Treating every failure as a model capability gap.'},{title:'Choose adaptation',detail:'Select prompt, retrieval or parameter update.',input:'Knowledge freshness and behavior needs',output:'Architecture decision',failure:'Fine-tuning facts that change every week.'},{title:'Evaluate trade-off',detail:'Compare quality, cost, latency and update workflow.',input:'Baseline and candidate',output:'Measured decision',failure:'No regression set or production rollback.'}],
        question:{prompt:'A company policy changes every week and answers must cite the current policy. What is usually the better starting design?',options:['Fine-tune the policy facts into model weights every week','RAG over versioned, access-controlled policy documents','Increase temperature','Remove citations'],answer:1,explanation:'RAG keeps changing knowledge in an external source that can be updated and cited.'},
        project:'Write an architecture decision record for a support assistant. Compare prompt-only, RAG and fine-tuning on quality, freshness, latency, cost and maintenance.',
        pitfalls:['Using fine-tuning as a frequently updated knowledge store.','Skipping a prompt-only baseline.','Comparing architectures without a fixed evaluation set.'],next:'Agent orchestration and human approval'
      }
    ]
  }],
  mlops: [{
    id:'model-lifecycle',
    title:'Model lifecycle, drift and release management',
    outcome:'Reproduce model builds, detect drift and roll back safely.',
    lessons:[
      {
        id:'model-registry-reproducibility',title:'Experiment tracking, model registry and reproducible builds',level:'Intermediate',duration:'70 min',
        why:'A model file alone is not a reproducible release. Teams need to know which data, code, parameters and evaluation produced it.',
        analogy:'A model registry is like a labelled product shelf with a manufacturing batch record, quality certificate and release status.',
        explanation:'Track source revision, dataset version, feature schema, parameters, metrics and artifact checksum. Register candidate models, evaluate them against release gates and promote an immutable version. Keep training and inference preprocessing versioned together.',
        keyPoints:['Record dataset and code versions, not only model weights.','Store artifact checksums and model signatures.','Promote immutable model versions through stages.','Use a reproducible baseline and explicit release gates.'],
        workedExample:'A release record can identify Git commit abc123, dataset snapshot ds-2026-04, feature schema v3, model artifact sha256 and validation PR-AUC 0.84.',
        code:'release_metadata = {\n  "model_name": "churn-risk",\n  "model_version": "1.4.0",\n  "git_commit": git_sha,\n  "dataset_version": dataset_snapshot,\n  "feature_schema": "v3",\n  "artifact_sha256": artifact_hash,\n  "validation_pr_auc": 0.84\n}',
        steps:[{title:'Track experiment',detail:'Capture parameters, data and environment versions.',input:'Training run',output:'Experiment record',failure:'Untracked mutable source data.'},{title:'Register candidate',detail:'Store artifact, checksum and evaluation report.',input:'Trained model',output:'Versioned candidate',failure:'Artifact and metadata mismatch.'},{title:'Promote safely',detail:'Apply gates and move immutable version to production.',input:'Candidate and release policy',output:'Approved model version',failure:'Manual overwrite without rollback target.'}],
        question:{prompt:'Why record the dataset version alongside model weights?',options:['To make the model file smaller','To reproduce and audit the exact training data used','To remove the need for tests','To hide model behavior'],answer:1,explanation:'The dataset snapshot is part of the model provenance and is necessary for reproducibility and audit.'},
        project:'Design a model release manifest with code commit, data version, feature schema, artifact checksum, metrics, approver and rollback version.',
        pitfalls:['Overwriting model artifacts in place.','Tracking metrics without data provenance.','Promoting a candidate without release gates.'],next:'Data drift, concept drift and rollback'
      },
      {
        id:'drift-monitoring-rollback',title:'Data drift, concept drift and safe rollback',level:'Advanced',duration:'75 min',
        why:'Production data changes. A model can remain online and return valid responses while becoming less useful or unfair.',
        analogy:'A navigation map becomes stale when roads change. Monitoring detects that the world no longer matches the assumptions behind the route.',
        explanation:'Data drift is a change in input distribution. Concept drift is a change in the relationship between inputs and target. Monitor feature distributions, missingness, prediction distributions, delayed labels and segment-level outcomes. Define thresholds, investigate alerts and roll back to a known-good model when needed.',
        keyPoints:['Input drift does not automatically prove performance degradation.','Concept drift requires outcome labels or reliable proxies to detect.','Monitor important segments, not just global averages.','Keep a known-good model and tested rollback procedure.'],
        workedExample:'If average transaction value doubles after a pricing change, feature drift may trigger an investigation. Wait for labelled outcomes or use validated proxies before declaring model quality has fallen.',
        code:'if feature_drift_score > DRIFT_ALERT_THRESHOLD:\n    create_investigation_ticket()\n\nif labelled_pr_auc < RELEASE_GUARDRAIL:\n    halt_promotion()\n    rollback_to(previous_approved_model)\n\n# Thresholds should be calibrated on historical behavior and reviewed by owners.',
        steps:[{title:'Establish baseline',detail:'Measure training/validation feature distributions and segment metrics.',input:'Approved model and reference data',output:'Monitoring baseline',failure:'Baseline does not represent production.'},{title:'Detect change',detail:'Track input distributions, missingness and delayed outcomes.',input:'Live feature and label streams',output:'Drift and performance alerts',failure:'Alert fatigue or missing labels.'},{title:'Respond',detail:'Investigate, retrain or roll back using release policy.',input:'Alert and incident evidence',output:'Documented action',failure:'Automatic retraining on corrupted data.'}],
        question:{prompt:'Does input data drift by itself prove that model accuracy has decreased?',options:['Yes, always','No; it signals a change that needs investigation and outcome evaluation','No, drift is impossible','Yes, if the model is a neural network'],answer:1,explanation:'Input distribution changes can be harmless or important. Measure outcomes and investigate affected segments.'},
        project:'Create a drift response playbook with baseline metrics, alert thresholds, label-delay handling, owner, retraining gate and rollback steps.',
        pitfalls:['Treating drift as proof of model failure.','Retraining automatically without data quality checks.','Monitoring global metrics while missing segment regressions.'],next:'Production capstone and operational readiness'
      }
    ]
  }]
};

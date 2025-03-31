import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.ensemble import RandomForestClassifier
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam
import numpy as np
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical

def svm_classification(df: pd.DataFrame, target_column: str) -> dict:
    # Separate features and target
    X = df.drop(columns=[target_column, 'Name', 'Grade'])
    y = df[target_column]

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Initialize and train the SVM classifier
    clf = SVC(kernel='rbf', random_state=42)
    clf.fit(X_train_scaled, y_train)

    # Make predictions on the test set
    y_pred = clf.predict(X_test_scaled)

    # Compute metrics
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    matrix = confusion_matrix(y_test, y_pred)

    return {
        'model_name': 'SVM',
        'accuracy': accuracy,
        'report': report,
        'confusion_matrix': matrix.tolist()  # Convert to list if needed
    }

def random_forest_classification(df: pd.DataFrame, target_column: str) -> dict:
    # Separate features and target
    X = df.drop(columns=[target_column, 'Name', 'Grade'])
    y = df[target_column]

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Optionally scale features (scaling is not mandatory for Random Forest)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Initialize and train the Random Forest classifier
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train_scaled, y_train)

    # Make predictions on the test set
    y_pred = clf.predict(X_test_scaled)

    # Compute metrics
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    matrix = confusion_matrix(y_test, y_pred)

    return {
        'model_name': 'Random Forest',
        'accuracy': accuracy,
        'report': report,
        'confusion_matrix': matrix.tolist()
    }

def neural_network_classification(df: pd.DataFrame, target_column: str) -> dict:
    # Separate features and target
    X = df.drop(columns=[target_column, 'Name', 'Grade'])
    y = df[target_column]

    # Encode target labels if necessary
    if y.dtype == object or y.dtype == 'str':
        le = LabelEncoder()
        y = le.fit_transform(y)

    # Determine the number of classes
    num_classes = np.unique(y).shape[0]

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # For neural network training, if more than 2 classes, use one-hot encoding
    if num_classes > 2:
        y_train_cat = to_categorical(y_train, num_classes=num_classes)
        y_test_cat = to_categorical(y_test, num_classes=num_classes)
    else:
        y_train_cat = y_train
        y_test_cat = y_test

    # Build a simple neural network model
    model = Sequential()
    model.add(Dense(64, input_dim=X_train_scaled.shape[1], activation='relu'))
    model.add(Dense(32, activation='relu'))
    if num_classes > 2:
        # Multi-class classification
        model.add(Dense(num_classes, activation='softmax'))
        loss = 'categorical_crossentropy'
    else:
        # Binary classification
        model.add(Dense(1, activation='sigmoid'))
        loss = 'binary_crossentropy'

    model.compile(optimizer=Adam(learning_rate=0.001), loss=loss, metrics=['accuracy'])

    # Train the model
    epochs = 50
    batch_size = 32
    model.fit(X_train_scaled, y_train_cat, epochs=epochs, batch_size=batch_size, verbose=0)

    # Make predictions on the test set
    y_pred_prob = model.predict(X_test_scaled, verbose=0)
    if num_classes > 2:
        y_pred = np.argmax(y_pred_prob, axis=1)
    else:
        y_pred = (y_pred_prob > 0.5).astype(int).flatten()

    # Compute metrics
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    matrix = confusion_matrix(y_test, y_pred)

    return {
        'model_name': 'Neural Network',
        'accuracy': accuracy,
        'report': report,
        'confusion_matrix': matrix.tolist()
    }
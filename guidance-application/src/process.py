import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import io
import json
import os

def validate_dataset(columns, type):
    expected_columns = []
    if type == 'ASSI-A':
        expected_columns = ['Name', 'Gender', 'Grade', 'Because I need at least a high-school degree in order to find a high-paying job later on.', 'Because I experience pleasure and satisfaction while learning new things.', 'Because I think that a high-school education will help me better prepare for the career I have chosen.', 'Because I really like going to school.', "Honestly, I don't know; I really feel that I am wasting my time in school.", 'For the pleasure I experience while surpassing myself in my studies.', 'To prove to myself that I am capable of completing my high-school degree.', 'In order to obtain a more prestigious job later on.', 'For the pleasure I experience when I discover new things never seen before.', 'Because eventually it will enable me to enter the job market in a field that I like.', 'Because for me, school is fun.', 'I once had good reasons for going to school; however, now I wonder whether I should continue.', 'For the pleasure that I experience while I am surpassing myself in one of my personal accomplishments.', 'Because of the fact that when I succeed in school I feel\r\nimportant.', 'Because I want to have "the good life" later on.', 'For the pleasure that I experience in broadening my\r\nknowledge about subjects which appeal to me.', 'Because this will help me make a better choice regarding my career orientation.', 'For the pleasure that I experience when I am taken by\r\ndiscussions with interesting teachers.', "I can't see why I go to school and frankly, I couldn't care\r\nless.", 'For the satisfaction I feel when I am in the process of\r\naccomplishing difficult academic activities.', 'To show myself that I am an intelligent person.', 'In order to have a better salary later on.', 'Because my studies allow me to continue to learn about\r\nmany things that interest me.', 'Because I believe that my high school education will\r\nimprove my competence as a worker.', 'For the "high" feeling that I experience while reading about various interesting subjects.', "I don't know; I can't understand what I am doing in school.", 'Because high school allows me to experience a personal satisfaction in my quest for excellence in my studies.', 'Because I want to show myself that I can succeed in my\r\nstudies.']
    elif type == 'ASSI-C':
        expected_columns = ['Name', 'Gender', 'Grade', 'Complain of aches or pains', 'Spend more time alone', 'Tire easily, little energy', 'Fidgety, unable to sit still', 'Have trouble with teacher', 'Less interested in school', 'Act as if driven by motor', 'Daydream too much', 'Distract easily', 'Are afraid of new situations', 'Feel sad, unhappy', 'Are irritable, angry', 'Feel hopeless', 'Have trouble concentrating', 'Less interested in friends', 'Fight with other children', 'Absent from school', 'School grades dropping', 'Down on yourself', 'Visit doctor with doctor finding nothing\r\nwrong', 'Have trouble sleeping', 'Worry a lot', 'Want to be with parent more than before', 'Feel that you are bad', 'Take unnecessary risks', 'Get hurt frequently', 'Seem to be having less fun', 'Act younger than children your age', 'Do not listen to rules', 'Do not show feelings', "Do not understand other people's feelings", 'Tease others', 'Blame others for your troubles', 'Take things that do not belong to you', 'Refuse to share']
    
    missing_columns = [col for col in expected_columns if col not in columns]
    return False if missing_columns else True

def upload_file(file, id, form_type):
    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    root_save_folder = 'uploads'
    if not os.path.exists(root_save_folder):
        os.makedirs(root_save_folder)

    type_save_folder = os.path.join(root_save_folder, form_type)
    if not os.path.exists(type_save_folder):
        os.makedirs(type_save_folder)
    
    csv_content = stream.getvalue()
    
    file_path =  os.path.join(type_save_folder, f'{id}.csv')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(csv_content)
    df = pd.read_csv(file_path)
    df['Name'] = df['Name'].astype(str)
    df.to_csv(file_path, index=False)
    return file_path

def upload_student_data(df, id, form_type):
    root_save_folder = 'student_data'
    df_original = pd.read_csv(f'uploads/{form_type}/{id}.csv')
    df_original['Cluster'] = df['Cluster']
        
    if not os.path.exists(root_save_folder):
        os.makedirs(root_save_folder)

    type_save_folder = os.path.join(root_save_folder, form_type)
    if not os.path.exists(type_save_folder):
        os.makedirs(type_save_folder)

    file_path = os.path.join(type_save_folder, f'{id}.csv')
    df_original.to_csv(file_path, index=False)

    return file_path

def upload_results(results):
    id = results['id']
    form_type = results['type']
    root_save_folder = 'results'

    # Create root directory if it doesn't exist
    if not os.path.exists(root_save_folder):
        os.makedirs(root_save_folder, exist_ok=True)

    # Create type-specific directory if it doesn't exist
    type_save_folder = os.path.join(root_save_folder, form_type)
    if not os.path.exists(type_save_folder):
        os.makedirs(type_save_folder, exist_ok=True)

    file_path = os.path.join(type_save_folder, f'{id}.json')
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
        return file_path
    except Exception as e:
        print(f"Error saving results: {e}")
        return None

def summarize_answers(uuid, form_type, gender, grade, cluster):
    file_path = os.path.join('student_data', form_type, f'{uuid}.csv')
    df = pd.read_csv(file_path)
    df = df.dropna(axis=0)

    if form_type == 'ASSI-C':
        # Convert 'Never', 'Sometimes', 'Often' to numerical values
        answer_map = {'Never': 0, 'Sometimes': 1, 'Often': 2}
        for col in df.columns:
            if col not in ['Gender', 'Grade', 'Name']:
                df[col] = df[col].map(answer_map)

    summary = {}
    # Filter the dataframe by gender and grade if they're not set to 'all'
    if gender != 'all':
        df = df[df['Gender'] == gender]
    if grade != 'all':
        df = df[df['Grade'] == int(grade)]
    if cluster != 'all':
        df = df[df['Cluster'] == int(cluster)]
    print(df.head(1))
        
    for column in df.columns:
        if column not in ['Name', 'Grade', 'Gender']:
            summary[column] = df[column].value_counts().to_dict()
    
    return summary

def summarize_answer_per_cluster(df_clustered, form_type):
    summary = []
    for cluster in df_clustered['Cluster'].unique():
        summary_cluster = {}
        df_cluster = df_clustered[df_clustered['Cluster'] == cluster]
        summary_cluster['cluster'] = cluster
        for column in df_cluster.columns:
            if column != 'Cluster':
                summary_cluster[column] = df_cluster[column].value_counts().to_dict()
        summary.append(summary_cluster)

    # For ASSI-C form type, revert numerical values back to text answers
    if form_type == 'ASSI-C':
        # Define the reverse mapping from numerical values to text answers
        reverse_answer_map = {0: 'Never', 1: 'Sometimes', 2: 'Often'}
        
        # For each cluster in the summary
        for cluster_summary in summary:
            # For each question in the cluster
            for question, answers in cluster_summary.items():
                # Skip the cluster identifier
                if question != 'cluster':
                    # Create a new dictionary with text answers
                    text_answers = {}
                    for num_value, count in answers.items():
                        # Handle gender column specifically
                        if question == 'Gender':
                            if num_value == 0:
                                text_answers['Female'] = count
                            elif num_value == 1:
                                text_answers['Male'] = count
                            else:
                                text_answers[num_value] = count
                        # Convert the numerical key to text if it's in our mapping
                        elif isinstance(num_value, (int, float)) and num_value in reverse_answer_map:
                            text_answers[reverse_answer_map[num_value]] = count
                        else:
                            # Keep as is if not a numerical value we're mapping
                            text_answers[num_value] = count
                    
                    # Replace the numerical answers with text answers
                    cluster_summary[question] = text_answers
    return summary


def load_data_and_preprocess(file_path, form_type):
    # Full DataFrame
    df = pd.read_csv(file_path)

    
    # Only questions
    df_questions_only = df.drop(columns=['Name', 'Grade'])

    if form_type == 'ASSI-C':
        # Convert 'Never', 'Sometimes', 'Often' to numerical values
        answer_map = {'Never': 0, 'Sometimes': 1, 'Often': 2}
        for col in df_questions_only.columns:
            if col not in ['Gender', 'Grade', 'Name']:
                df_questions_only[col] = df_questions_only[col].map(answer_map)

    # Transform Gender to Numeric
    df_questions_only['Gender'] = df_questions_only['Gender'].map({'Female': 0, 'Male': 1})
    
    # Remove Na
    df_questions_only = df_questions_only.dropna(axis=0)

    scaler = StandardScaler()
    # Scaled Only Questions
    df_scaled = scaler.fit_transform(df_questions_only)
    
    # Scaled Full Dataframe, including Name and grade
    df_scaled = pd.DataFrame(df_scaled, columns=df_questions_only.columns)
    df_scaled['Name'] = df['Name']
    df_scaled['Grade'] = df['Grade']
    
    root_save_folder = 'uploads'
    if not os.path.exists(root_save_folder):
        os.makedirs(root_save_folder)
    filename = os.path.join(root_save_folder, 'full_df.csv')
    df.to_csv(filename, index=False)


    return df, df_questions_only, df_scaled, 

def count_items_in_cluster(df_pca, cluster):
    return df_pca[df_pca['Cluster'] == cluster].shape[0]

def kmeans(df_pca, df_original_questions_only):
    try:
        # Use the Elbow Method to find the optimal number of clusters
        distortions = []
        K = range(1, 11)
        for k in K:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(df_pca.drop(columns=['Name', 'Grade']))
            distortions.append(kmeans.inertia_)  # Inertia is the sum of squared distances to the closest centroid

        # Find the optimal number of clusters (elbow point)
        optimal_k = np.argmax(np.diff(distortions, 2)) + 2  # Second derivative to find the elbow
        
        # Fit KMeans with optimal number of clusters
        kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
        df_pca['Cluster'] = kmeans.fit_predict(df_pca.drop(columns=['Name', 'Grade']))

        cluster_count = {}

        # Calculate the number of items in each cluster
        for cluster in range(optimal_k):
            cluster_count["Cluster " + str(cluster + 1)] = count_items_in_cluster(df_pca, cluster)
        
        df_original_questions_only['Cluster'] = df_pca['Cluster'].apply(lambda x: f'cluster_{x+1}')
        optimal_k = int(optimal_k)
        return df_pca, optimal_k, cluster_count, df_original_questions_only

    except Exception as e:
        print(f"Error in kmeans: {e}")
        return None, None


def pca(df_scaled):
        pca = PCA()
        optimal_pc = None
        df_name_grade = df_scaled[['Name', 'Grade']]
        df_scaled_questions_only = df_scaled.drop(columns=['Name', 'Grade'])
        pca.fit(df_scaled_questions_only)
        eigenvalues = pca.explained_variance_
        optimal_pc = np.sum(eigenvalues > 1)
        pca = PCA(n_components=optimal_pc)
        principal_components = pca.fit_transform(df_scaled_questions_only)
        df_pca = pd.DataFrame(principal_components)
        df_pca['Name'] = df_name_grade['Name']
        df_pca['Grade'] = df_name_grade['Grade']

        return df_pca, int(optimal_pc)

def get_uploaded_result_by_uuid(id, type):
    root_save_folder = 'results'
    type_save_folder = os.path.join(root_save_folder, type)
    file_path = os.path.join(type_save_folder, f'{id}.json')
    
    try:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return None
            
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        print(f"Error reading results: {e}")
        return None




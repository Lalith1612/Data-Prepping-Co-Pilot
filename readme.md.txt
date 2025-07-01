Data Prepping Co-Pilot
Your intelligent toolkit for flawless data cleaning and preprocessing. This Streamlit web application provides a user-friendly interface to upload your datasets, apply various cleaning and transformation operations, and download the refined data for further analysis.

🌟 Features
The Data Prepping Co-Pilot offers a comprehensive set of features to streamline your data preparation workflow:

File Uploads: Supports various data formats including CSV, Excel (XLS, XLSX), Parquet, and JSON.

Two Cleaning Modes:

One-Click Automated: Applies a standard set of best-practice rules for quick and efficient cleaning.

Interactive Control: Provides granular control over each cleaning step, allowing you to customize the process according to your data's needs.

Data Profiling: Get an immediate overview of your uploaded data, including:

Number of rows and columns.

Total missing cells.

Preview of the dataset (first few rows).

Comprehensive Data Cleaning Operations:

Duplicate Handling: Remove duplicate rows to ensure data uniqueness.

Whitespace Trimming: Clean up leading/trailing whitespace from string columns.

Empty String Handling: Manage empty strings by treating them as missing values or imputing them.

Data Type Conversion: Automatically convert columns to appropriate data types.

Text Case Normalization: Convert text to lowercase, uppercase, or keep as is.

Missing Value Imputation: Strategically fill missing numeric values (Median, Mean, Mode) and string values (customizable).

Outlier Handling: Identify and manage outliers using methods like the IQR method.

Feature Scaling: Apply standardization (Z-score) or normalization (Min-Max) to numeric features.

Column Dropping: Option to automatically drop columns with a high percentage of missing values based on a configurable threshold.

Data Sorting: Sort your dataset by a selected column in ascending or descending order.

Data Validation: Perform checks to ensure data integrity, reporting any rows that fail predefined validation rules (e.g., age range, email format).

Processing Results & Summary: After cleaning, view a detailed summary report of the applied transformations and statistics.

Download Cleaned Data: Crucially, you can download the cleaned dataset in its original format (CSV, Excel, Parquet, JSON) for immediate use in your downstream tasks.

🛠️ Installation and Setup
To run the Data Prepping Co-Pilot locally, follow these steps:

Clone the Repository (or Download Files):
If using Git:

Bash

git clone <repository_url> # Replace <repository_url> with your repository's URL
cd <repository_directory>
Otherwise, ensure you have all the project files (app.py, data_pipeline.py, utils.py, style.css, requirements.txt) in a single directory.

Create a Virtual Environment (Recommended):

Bash

python -m venv venv
Activate the Virtual Environment:

Windows:

Bash

.\venv\Scripts\activate
macOS/Linux:

Bash

source venv/bin/activate
Install Dependencies:
Navigate to the project directory (where requirements.txt is located) and install the necessary libraries:

Bash

pip install -r requirements.txt
🚀 How to Run the Application
Once the setup is complete, you can launch the Streamlit application:

Navigate to the Project Directory:
Ensure your terminal is in the directory containing app.py.

Run the Streamlit App:

Bash

streamlit run app.py
This command will open the Data Prepping Co-Pilot in your default web browser.

📝 Usage
Upload your data file: Use the "Upload your data file" widget on the left sidebar to select your dataset.

Select Cleaning Mode:

Choose "One-Click Automated" for a quick, standardized clean.

Choose "Interactive Control" to reveal detailed configuration options for each cleaning step.

Configure Options (Interactive Mode): Adjust the toggles, select boxes, and text inputs to define your desired cleaning operations.

Run Cleaning Process: Click the "🚀 Run Cleaning Process" button. A progress bar will indicate the current step.

View Results: Once the process is complete, the right column will display:

Data Profile: Initial overview of the uploaded data.

Summary Report: Key statistics about the cleaned data and the transformations applied.

Cleaned Data: The refined dataset preview.

Download Cleaned File: A crucial button to download your processed data in its original format.

Validation Errors: If data validation was enabled, any rows that failed validation will be listed here.

 Project Structure
app.py: The main Streamlit application file, handling the UI, user interactions, and orchestrating the data pipeline.

data_pipeline.py: Contains the DataPipeline class, which encapsulates all the data cleaning and preprocessing logic. This module defines the various transformation methods and the order of operations.

utils.py: Provides utility functions such as read_file (for loading various file formats), to_output_format (for converting DataFrames to different output formats for download), profile_data (for generating data summary statistics), and estimate_processing_time.

style.css: Custom CSS file to apply a modern "Glassmorphism & Aurora UI" design to the Streamlit application.

requirements.txt: Lists all the Python dependencies required to run the application.
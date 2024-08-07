import boto3
import json
import datetime
import uuid

print('Loading function')
dynamodb = boto3.client('dynamodb')
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')

# Replace with your custom model ARN
CUSTOM_MODEL_ARN = 'arn:aws:rekognition:us-east-1:131758576670:project/fitsnap/version/fitsnap.2024-08-07T01.33.34/1723005214664'

# --------------- Helper Functions ------------------
def analyze_image(bucket, key):
    print(f"Analyzing image: {bucket}/{key}")
    response = rekognition.detect_custom_labels(
        ProjectVersionArn=CUSTOM_MODEL_ARN,
        Image={"S3Object": {"Bucket": bucket, "Name": key}},
        MaxResults=50
    )
    print("Full Rekognition response:", json.dumps(response, indent=2))
    return response

def suggest_detailed_dietary_plan(labels):
    dietary_plans = {
        'Muscular': [
            "High protein intake (1.6-2.2g per kg of body weight)",
            "Moderate to high carbohydrate intake",
            "Balanced fat intake (0.5-1g per kg of body weight)",
            "Focus on lean meats, fish, eggs, and plant-based proteins",
            "Complex carbohydrates like brown rice, quinoa, and sweet potatoes",
            "Healthy fats from nuts, seeds, and avocados",
            "5-6 smaller meals throughout the day",
            "Pre and post-workout nutrition",
            "Adequate hydration (at least 3-4 liters per day)"
        ],
        'Obese': [
            "Calorie deficit diet (500-750 calories below maintenance)",
            "High protein intake (1.2-1.6g per kg of ideal body weight)",
            "Low to moderate carbohydrate intake",
            "Emphasis on high-fiber foods",
            "Plenty of non-starchy vegetables",
            "Lean proteins like chicken, turkey, and fish",
            "Healthy fats in moderation",
            "Avoid processed foods and sugary drinks",
            "Regular meal timing to control hunger",
            "Mindful eating practices"
        ],
        'Skinny': [
            "Calorie surplus diet (300-500 calories above maintenance)",
            "High protein intake (1.6-2.2g per kg of body weight)",
            "High carbohydrate intake",
            "Moderate healthy fat intake",
            "Emphasis on nutrient-dense, calorie-rich foods",
            "Frequent meals and snacks (6-8 times per day)",
            "Inclusion of healthy high-calorie foods like nuts, seeds, and avocados",
            "Liquid calories through smoothies or protein shakes",
            "Focus on compound exercises to stimulate appetite",
            "Gradual increase in portion sizes"
        ],
        'Fit': [
            "Balanced macronutrient intake (40% carbs, 30% protein, 30% fat)",
            "Emphasis on whole, unprocessed foods",
            "Variety of fruits and vegetables for micronutrients",
            "Lean proteins and plant-based protein sources",
            "Complex carbohydrates and whole grains",
            "Healthy fats from sources like olive oil, nuts, and fatty fish",
            "Proper pre and post-workout nutrition",
            "Hydration with water and electrolyte-rich beverages",
            "Moderate portion sizes",
            "Occasional treats in moderation"
        ],
        'Fat': [
            "Moderate calorie deficit (300-500 calories below maintenance)",
            "High protein intake (1.2-1.6g per kg of ideal body weight)",
            "Moderate to low carbohydrate intake",
            "Emphasis on low glycemic index carbohydrates",
            "Increased fiber intake (25-30g per day)",
            "Lean protein sources at each meal",
            "Healthy fats in moderation",
            "Increased water intake (at least 8-10 glasses per day)",
            "Limit processed foods and added sugars",
            "Include metabolism-boosting foods like green tea and chili peppers"
        ]
    }
    
    detailed_plan = []
    for label in labels:
        if label in dietary_plans:
            detailed_plan.extend(dietary_plans[label])
    
    if not detailed_plan:
        detailed_plan = dietary_plans['Fit']  # Default to 'Fit' plan if no matching labels
    
    return list(set(detailed_plan))  # Remove duplicates

def store_labels_and_plan(tableName, userId, labels, dietary_plan, confidence):
    timestamp = datetime.datetime.now().isoformat()
    response = dynamodb.put_item(
        TableName=tableName,
        Item={
            'UserId': {'S': userId},
            'Timestamp': {'S': timestamp},
            'Labels': {'SS': labels},
            'DietaryPlan': {'SS': dietary_plan},
            'Confidence': {'N': str(confidence)}
        }
    )
    print(f"DynamoDB response: {json.dumps(response, indent=2)}")

# --------------- Main handler ------------------
def lambda_handler(event, context):
    # Get the object from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    try:
        # Calls Amazon Rekognition to analyze the image
        response = analyze_image(bucket, key)
        print(response)
        # Extract labels and confidence
        labels_with_confidence = [(label['Name'], label['Confidence']) for label in response.get('CustomLabels', [])]
        labels = [label for label, _ in labels_with_confidence]
        confidence = max([conf for _, conf in labels_with_confidence], default=0)
        print("Extracted labels:", labels)
        print("Confidence:", confidence)
        
        if not labels:
            print("No labels detected. Skipping dietary plan and DynamoDB storage.")
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Image analyzed, but no labels were detected.',
                    'labels': [],
                    'dietary_plan': [],
                    'confidence': 0
                })
            }
        
        # Suggest detailed dietary plan based on labels
        dietary_plan = suggest_detailed_dietary_plan(labels)
        print("Suggested dietary plan:", dietary_plan)
        
        # Use S3 object key as userId, or generate UUID if not suitable
        userId = key if key else str(uuid.uuid4())
        
        # Store labels, dietary plan, and confidence in DynamoDB
        store_labels_and_plan('fitsnap-table', userId, labels, dietary_plan, confidence)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Image analyzed, labels, dietary plan, and confidence stored successfully!',
                'labels': labels,
                'dietary_plan': dietary_plan,
                'confidence': confidence
            })
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        print(f"Error processing object {key} from bucket {bucket}.")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error processing image',
                'error': str(e)
            })
        }
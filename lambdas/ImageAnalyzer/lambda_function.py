from __future__ import print_function
import boto3
import json
import datetime

print('Loading function')

dynamodb = boto3.client('dynamodb')
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')

# --------------- Helper Functions ------------------

def analyze_image(bucket, key):
    response = rekognition.detect_labels(
        Image={"S3Object": {"Bucket": bucket, "Name": key}},
        MaxLabels=50,  # Increased to 50 to capture more labels
        MinConfidence=75
    )
    return response

def store_stats_and_plan(tableName, userId, stats, plan, labels):
    timestamp = datetime.datetime.now().isoformat()
    response = dynamodb.put_item(
        TableName=tableName,
        Item={
            'UserId': {'S': userId},
            'Timestamp': {'S': timestamp},
            'Stats': {'L': [{'S': stat} for stat in stats]},  # Store stats as list of strings
            'DietaryPlan': {'L': [{'S': meal} for meal in plan]},  # Store dietary plan as list of strings
            'Labels': {'L': [{'S': label} for label in labels]}  # Store labels as list of strings
        }
    )

# --------------- Main handler ------------------

def lambda_handler(event, context):
    # Get the object from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    try:
        # Calls Amazon Rekognition to analyze the image
        response = analyze_image(bucket, key)
        
        # Extract labels
        labels = [label['Name'] for label in response['Labels']]
        
        # Generate current stats (simplified)
        currentStats = [
            'bodyFatPercentage: 20-25%',  # Example value
            'muscleMass: Average',        # Example value
            'bmi: 22',                    # Example value
            'bodyShape: Mesomorph'        # Example value
        ]
        
        # Generate dietary plan (simplified)
        dietaryPlan = [
            'breakfast: Oatmeal with protein powder and berries',
            'lunch: Grilled chicken breast, quinoa, and steamed vegetables',
            'snack1: Greek yogurt with almonds',
            'dinner: Salmon, sweet potatoes, and asparagus',
            'snack2: Cottage cheese with fruit'
        ]
        
        # Extract user ID from object metadata
        ret = s3.head_object(Bucket=bucket, Key=key)
        userId = ret['Metadata']['userid']
        
        # Store stats, plan, and labels in DynamoDB
        store_stats_and_plan('fitsnap-table', userId, currentStats, dietaryPlan, labels)
        
        # Print response to console
        print(response)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Image analyzed and stats stored successfully!',
                'labels': labels
            })
        }
    except Exception as e:
        print(e)
        print("Error processing object {} from bucket {}.".format(key, bucket))
        raise e

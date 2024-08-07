import json
import boto3
from boto3.dynamodb.conditions import Key
import time
import traceback

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('fitsnap-table')

def lambda_handler(event, context):
    print('Event:', json.dumps(event))
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
    }
    
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    s3_object_key = event['queryStringParameters'].get('key')
    
    if not s3_object_key:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Missing S3 object key'})
        }
    
    try:
        print(f"Querying DynamoDB for key: {s3_object_key}")
        max_retries = 3
        for attempt in range(max_retries):
            response = table.query(
                KeyConditionExpression=Key('UserId').eq(s3_object_key)
            )
            
            print(f"DynamoDB response: {json.dumps(response, default=str)}")
            
            items = response.get('Items', [])
            
            if items:
                latest_result = items[-1]
                # Convert sets to lists for JSON serialization
                labels = list(latest_result.get('Labels', set()))
                dietary_plan = list(latest_result.get('DietaryPlan', set()))
                confidence = float(latest_result.get('Confidence', 0))
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'Labels': labels,
                        'DietaryPlan': dietary_plan,
                        'Confidence': confidence
                    })
                }
            
            if attempt < max_retries - 1:
                print(f"No items found. Retry attempt {attempt + 1}")
                time.sleep(1)
        
        print("No results found after all retries")
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'No results found for the given key'})
        }
    
    except Exception as e:
        print('Error:', str(e))
        print('Traceback:', traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)})
        }
import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('fitsnap-table')

def lambda_handler(event, context):
    print('Event:', json.dumps(event))
    
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
    }
    
    # Handle OPTIONS request
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    # Get the S3 object key from the query string parameters
    s3_object_key = event['queryStringParameters'].get('key')
    
    if not s3_object_key:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Missing S3 object key'})
        }
    
    try:
        # Query DynamoDB
        response = table.query(
            KeyConditionExpression=Key('UserId').eq(s3_object_key)
        )
        
        items = response.get('Items', [])
        
        if not items:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'No results found for the given key'})
            }
        
        # Return the most recent result (assuming items are sorted by timestamp)
        latest_result = items[-1]
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'Labels': latest_result.get('Labels', []),
                'DietaryPlan': latest_result.get('DietaryPlan', []),
                'Confidence': float(latest_result.get('Confidence', 0))
            })
        }
    
    except Exception as e:
        print('Error:', str(e))
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Internal server error'})
        }
        
const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const dynamoDB = new DynamoDBClient({ region: 'us-west-2', endpoint: 'http://localhost:8000' });

const createTableParams = {
  TableName: 'media',
  KeySchema: [
    { AttributeName: 'mediaId', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'mediaId', AttributeType: 'S' },
  ],
  ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
};

const command = new CreateTableCommand(createTableParams);

dynamoDB.send(command).then((data) => {
  console.log('Table Created', data);
}).catch((err) => {
  console.error('Error creating table:', err);
});

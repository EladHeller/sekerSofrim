#!/bin/bash
zip -rq9 src.zip ./src
aws lambda update-function-code \
    --function-name ssofrim-test \
    --zip-file fileb://src.zip \
    --region us-west-2
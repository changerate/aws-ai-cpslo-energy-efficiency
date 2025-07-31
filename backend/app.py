from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import boto3

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure AWS
s3 = boto3.client("s3", region_name="us-west-2")
BUCKET_NAME = "csu-summer-camp-electricity-2025"

@app.get("/list-files")
def list_files():
    response = s3.list_objects_v2(Bucket=BUCKET_NAME)
    if "Contents" not in response:
        return response
    return [obj["Key"] for obj in response["Contents"]]






import AWS from "aws-sdk";

class AwsService {
  private s3: AWS.S3;
  constructor() {
    console.log(process.env);
    AWS.config.update({
      secretAccessKey: process.env.VUE_APP_SECRET_ACCESS_KEY,
      accessKeyId: process.env.VUE_APP_AWS_ACCESS_KEY_ID,
      region: "eu-west-3",
    });
    this.s3 = new AWS.S3();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getObj(key: string, bucket = "soundsonner-data"): Promise<any> {
    return new Promise((resolve, reject) => {
      this.s3.getObject(
        {
          Bucket: bucket,
          Key: key,
        },
        (err, data) => {
          if (err) {
            console.log(err);
            reject();
          }
          resolve(JSON.parse(atob(data.Body.toString("base64"))));
        }
      );
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveObj(Key: string, body: any, Bucket = "soundsonner-data") {
    return new Promise((resolve, reject) => {
      this.s3.putObject(
        {
          Bucket,
          Key,
          Body: JSON.stringify(body),
          ContentType: "application/json; charset=utf-8",
        },
        (err, data) => {
          if (err) {
            console.log(err);
            reject();
          }
          resolve(data);
        }
      );
    });
  }
}

export default new AwsService();

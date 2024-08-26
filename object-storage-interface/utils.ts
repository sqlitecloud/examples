import { GetObjectRequest, PutObjectRequest } from "./types";

export const fieldCheck = (params: PutObjectRequest | GetObjectRequest) => { 
  const { bucket, key } = params;
  if (!bucket || !key) { 
    return { error: "Missing required fields", result: null, message: "Missing required fields" }; 
  }
  return { error: null, result: null, message: "Field check passed" };
}

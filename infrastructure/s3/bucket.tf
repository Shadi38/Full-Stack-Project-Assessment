resource "aws_s3_bucket" "buckets3" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.buckets3.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


resource "aws_s3_bucket_policy" "public_access" {
  bucket = aws_s3_bucket.buckets3.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.buckets3.arn}/*"
    }]
  })
}

resource "aws_s3_bucket_website_configuration" "static_website" {
  bucket = aws_s3_bucket.buckets3.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}
resource "aws_s3_object" "index_html" {
  bucket       = aws_s3_bucket.buckets3.id
  key          = "index.html"
  source       = "../client/build/index.html"
  content_type = "text/html"
}




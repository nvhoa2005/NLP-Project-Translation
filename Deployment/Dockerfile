# Sử dụng Python 3.9 trên Linux
FROM python:3.9

# Tạo thư mục làm việc
WORKDIR /code

# Copy file cài đặt và cài thư viện
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy toàn bộ code và model vào container
COPY . /code

# Cấp quyền cho user (bắt buộc trên Hugging Face)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Mở code app
WORKDIR /code

# Chạy server trên port 7860 (Port mặc định của HF Spaces)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
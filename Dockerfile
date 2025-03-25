FROM nginx:alpine

# 기본 Nginx 설정 제거
RUN rm -rf /usr/share/nginx/html/*

# 빌드된 앱을 Nginx 서버로 복사
COPY dist/ /usr/share/nginx/html/

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 필요한 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"] 
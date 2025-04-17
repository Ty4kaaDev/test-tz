## Test tz for work
### sql docker 
```
docker run --name mysql -e MYSQL_ROOT_PASSWORD=admin -e MYSQL_DATABASE=admin -e MYSQL_USER=admin -e MYSQL_PASSWORD=admin -p 3306:3306 -d mysql:8
```
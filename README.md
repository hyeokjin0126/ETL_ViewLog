![image](https://github.com/user-attachments/assets/5c0813ca-944f-4957-a779-3c21e91745d7)

# 1\. Kinesis Stream 만들기
Kinesis Stream 콘솔에서 "track\_stream" 데이터 스트림을 만들어줍니다.

![image](https://github.com/user-attachments/assets/2e213b25-fec5-4fb4-8bc8-a9846298a84d)

<br>

# 2\. Glue DB 만들기
Glue에서 DataBase를 하나 만들어줍니다.

![image](https://github.com/user-attachments/assets/d0bdda88-ad40-4423-a506-870517e9a852)

<br>

# 3\. Apache Flink Studio 만들기
Kinesis Data Analytics 콘솔에서 Apache Flink 애플리케이션을 만들어줍니다.

![image](https://github.com/user-attachments/assets/d6f2c121-c572-4bfe-8f90-e4013c61a5a6)

<br>

# 4\. Apache Flink Studio -Table 만들기
track\_table, view\_table, product\_table을 만들어줍니다.
```
%flink.ssql(type=update)

DROP TABLE if exists track_table;
CREATE TABLE track_table (
    user_account VARCHAR,
    view_date TIMESTAMP(3), -- 중복
    WATERMARK FOR view_date AS view_date - INTERVAL '5' SECOND -- 중복
    video_id VARCHAR,
    video_name VARCHAR,
    video_time VARCHAR,
    watched_time VARCHAR,
    status VARCHAR,
) WITH (
  'connector' = 'kinesis',
  'stream' = 'track_stream',
  'aws.region' = 'ap-northeast-2',
  'scan.stream.initpos' = 'TRIM_HORIZON',
  'format' = 'json',
  'json.timestamp-format.standard' = 'ISO-8601'
);
```
```
%flink.ssql(type=update)

DROP TABLE if exists view_table;
CREATE TABLE view_table (
    user_account VARCHAR,
    view_date TIMESTAMP(3), -- 중복
    video_id VARCHAR,
    video_name VARCHAR,
    video_time VARCHAR,
    watched_time VARCHAR,
    status VARCHAR
) WITH (
  'connector' = 'kinesis',
  'stream' = 'track_stream',
  'aws.region' = 'ap-northeast-2',
  'format' = 'json'
);
```

<br>

# 5. Apache Flink Studio - Kinesis Stream으로 데이터 전송 및 확인
track\_stream 과 연결되 track\_table에 값이 추가되면 view\_table로 추가하도록 설정해줍니다.
```
%flink.ssql(type=update)

INSERT INTO view_table
SELECT user_account, view_date, video_id, video_name, video_time, watched_time, status
FROM track_table;
```
```
%flink.ssql

SELECT * FROM view_table;
```
track\_stream 과 연결되 track\_table에 값이 추가되면 popular\_table로 추가하도록 설정해줍니다.
```
%flink.ssql(type=update)

INSERT INTO popular_table
SELECT user_account, view_date, video_id, video_name, video_time, watched_time, status
FROM track_table;
```
```
%flink.ssql

SELECT * FROM popular_table;
```

<br>

# 6\. QuickSight로 시각화 하기

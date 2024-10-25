This is the template repo for vuejs and flask project

1. set up frontend
```
cd frontend
npm install
npm run serve
```

2. set up backend
```
cd backend
python run-data-backend.py
```

Frontend Environment:
- vue@2.6.12
- d3v5
- node v16.20.2 (npm v8.19.4)

Backend Environment (You can directly use the environment.yml file in /backend):
```
cd backend
conda env create -f environment.yml --name eminds
conda activate eminds
```
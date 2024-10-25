This is the template repo for vuejs and flask project

1. set up frontend
```bash
cd frontend
# You can skip installing if you use the packages "node_modules" provided in the repo.
npm install
npm run serve
```

2. set up backend
```
cd backend
python run-data-backend.py
```

Frontend Environment & Dependencies:
- `node@6.20.2` (`npm@8.19.4`)
- `vue@2.6.12`
- `d3@5`

Backend Environment (You can directly use the environment.yml file in /backend):
```
cd backend
conda env create -f environment.yml --name eminds
conda activate eminds
```

cd guidance-application
python -m venv venv
venv/scripts/activate
pip intall -r requirements.txt
cd ..
cd guidance-client
docker build -t client .
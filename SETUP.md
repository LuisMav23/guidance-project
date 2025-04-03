# Guidance System Setup Guide

This guide will walk you through setting up the Guidance System application from installation to running it with Docker.

## Prerequisites

Before you begin, ensure you have the following software installed on your system:

- [Docker](https://www.docker.com/get-started) (version 20.10.0 or higher)
- [Git](https://git-scm.com/downloads) (optional, for cloning the repository)
- [Python](https://www.python.org/downloads/release/python-3110/) (version 3.11 only)


## Installation Steps

### 1. Clone or Download the Repository
```bash
git clone https://github.com/LuisMav23/guidance-project.git
```

### 2. Navigate To The Project Directory
```bash
cd guidance-project
```

### 3. Set up backend
```bash
cd guidance-application
python -m venv venv
venv/scripts/activate
pip intall -r requirements.txt
```

### 4. Set up frotend
You must first run docker desktop
```bash
cd guidance-client
docker build -t client .
docker run -p 3000:3000 client
```



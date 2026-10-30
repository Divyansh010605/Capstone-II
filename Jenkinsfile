pipeline {
    agent any

    environment {
        PROJECT_NAME = "stock-market-ai"
        DOCKER_COMPOSE_FILE = "docker-compose.yml"
    }

    stages {
        stage('1. Git Checkout') {
            steps {
                echo 'Checking out source repository branch...'
                checkout scm
            }
        }

        stage('2. Dependency Installation') {
            steps {
                echo 'Installing Python Backend & AI Engine dependencies...'
                sh '''
                    python3 -m pip install --upgrade pip
                    python3 -m pip install -r backend/requirements.txt
                '''
                echo 'Installing Node Frontend dependencies...'
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('3. Code Quality Checks') {
            steps {
                echo 'Running Flake8 / Linters on Python codebase...'
                sh '''
                    python3 -m pip install flake8
                    flake8 backend/app ai_engine --count --select=E9,F63,F7,F82 --show-source --statistics || true
                '''
            }
        }

        stage('4. Backend Testing') {
            steps {
                echo 'Executing Pytest Unit & Integration Test Suites...'
                sh '''
                    export PYTHONPATH=.
                    python3 -m pytest backend/tests -v --junitxml=backend-test-results.xml
                '''
            }
            post {
                always {
                    junit testResults: 'backend-test-results.xml', allowEmptyResults: true
                }
            }
        }

        stage('5. Frontend Testing & Build') {
            steps {
                echo 'Building and verifying React production asset bundle...'
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('6. Docker Image Build') {
            steps {
                echo 'Building production container images via Docker Compose...'
                sh 'docker compose build'
            }
        }

        stage('7. Docker Compose Deployment') {
            steps {
                echo 'Starting multi-container services in detached mode...'
                sh 'docker compose down --remove-orphans || true'
                sh 'docker compose up -d'
            }
        }

        stage('8. Application Health Check') {
            steps {
                echo 'Verifying running service health checks...'
                sleep 15
                sh '''
                    curl --fail --retry 5 --retry-delay 3 http://localhost:8000/health
                    curl --fail --retry 5 --retry-delay 3 http://localhost:8000/docs
                '''
            }
        }
    }

    post {
        success {
            echo "CI/CD Pipeline Succeeded: Stock Market AI Platform deployed successfully!"
        }
        failure {
            echo "CI/CD Pipeline Failed: Inspect stage logs for debugging."
            sh 'docker compose logs --tail=100 || true'
        }
        always {
            cleanWs deleteDirs: true, notFailBuild: true
        }
    }
}

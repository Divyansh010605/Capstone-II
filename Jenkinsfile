pipeline {
    agent any

    // Automatically poll SCM every minute for new commits
    triggers {
        pollSCM('* * * * *')
    }

    environment {
        PYTHONPATH = "${WORKSPACE}"
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source repository...'
                checkout scm
            }
        }

        stage('Backend Dependencies & Test') {
            steps {
                echo 'Running Python backend and AI engine tests...'
                // Windows vs Unix step support
                script {
                    if (isUnix()) {
                        sh '''
                            python3 -m venv venv || python -m venv venv
                            . venv/bin/activate
                            pip install --upgrade pip
                            pip install -r backend/requirements.txt
                            PYTHONPATH=. pytest backend/tests/ -v
                        '''
                    } else {
                        bat '''
                            python -m venv venv
                            call venv\\Scripts\\activate.bat
                            python -m pip install --upgrade pip
                            pip install -r backend\\requirements.txt
                            set PYTHONPATH=%CD%
                            pytest backend\\tests\\ -v
                        '''
                    }
                }
            }
        }

        stage('Frontend Build') {
            steps {
                echo 'Building React / Vite frontend...'
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh '''
                                npm ci || npm install
                                npm run build
                            '''
                        } else {
                            bat '''
                                call npm ci || call npm install
                                call npm run build
                            '''
                        }
                    }
                }
            }
        }

        stage('Docker Images Build') {
            steps {
                echo 'Building production Docker images...'
                script {
                    if (isUnix()) {
                        sh '''
                            docker compose build backend frontend
                        '''
                    } else {
                        bat '''
                            docker compose build backend frontend
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
            cleanWs deleteDirs: true, notFailBuild: true
        }
        success {
            echo 'Build, tests, and Docker images successfully verified!'
        }
        failure {
            echo 'Pipeline failed. Check stage logs for details.'
        }
    }
}

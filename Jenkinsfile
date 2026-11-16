pipeline {
    agent any

    // Automatically poll SCM every minute for new commits
    triggers {
        pollSCM('* * * * *')
    }

    environment {
        // Ensure Python, Scripts (pytest), Node.js, and Docker paths are always available to Jenkins on Windows
        PATH = "C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311;C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311\\Scripts;C:\\Program Files\\nodejs;C:\\Program Files\\Docker\\Docker\\resources\\bin;${env.PATH}"
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
                script {
                    if (isUnix()) {
                        sh '''
                            python3 -m pip install -r backend/requirements.txt
                            PYTHONPATH=. pytest backend/tests/test_all_endpoints_comprehensive.py -v
                        '''
                    } else {
                        bat '''
                            @echo off
                            set "PYTHONPATH=%WORKSPACE%"
                            python -m pytest backend\\tests\\test_all_endpoints_comprehensive.py -v
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
                                if [ ! -d "node_modules" ]; then
                                    echo "Installing dependencies..."
                                    npm install --prefer-offline --no-audit
                                fi
                                npm run build
                            '''
                        } else {
                            bat '''
                                @echo off
                                if not exist "node_modules" (
                                    echo Installing frontend dependencies...
                                    call npm install --prefer-offline --no-audit
                                )
                                echo Running Vite production build...
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
                            @echo off
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
        }
        success {
            echo 'Build, tests, and Docker images successfully verified!'
        }
        failure {
            echo 'Pipeline failed. Check stage logs for details.'
        }
    }
}

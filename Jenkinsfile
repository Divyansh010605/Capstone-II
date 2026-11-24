
pipeline {
    agent any

    // GitHub Webhook Trigger
    triggers {
        githubPush()
    }

    // Pipeline Configuration
    options {
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(
            numToKeepStr: '10',
            artifactNumToKeepStr: '5'
        ))
        skipDefaultCheckout(true)
    }

    environment {
        PYTHONPATH = "${WORKSPACE}"
        CI = 'true'
        PIP_DISABLE_PIP_VERSION_CHECK = '1'
        PIP_NO_INPUT = '1'
        PATH = "C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311;C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311\\Scripts;C:\\Program Files\\nodejs;C:\\Program Files\\Docker\\Docker\\resources\\bin;${env.PATH}"
    }

    stages {

        // -----------------------------------------
        // STAGE 1: CHECKOUT
        // -----------------------------------------
        stage('Source Code Checkout') {
            steps {
                echo 'Checking out Capstone-II repository...'

                checkout scm

                script {
                    try {
                        if (isUnix()) {
                            env.GIT_COMMIT_ID = sh(
                                script: 'git rev-parse --short HEAD',
                                returnStdout: true
                            ).trim()
                        } else {
                            env.GIT_COMMIT_ID = bat(
                                script: '@git rev-parse --short HEAD',
                                returnStdout: true
                            ).trim()
                        }
                    } catch (Exception e) {
                        env.GIT_COMMIT_ID = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'
                    }
                }

                echo "Building commit: ${env.GIT_COMMIT_ID}"
            }
        }

        // -----------------------------------------
        // STAGE 2: ENVIRONMENT CHECK
        // -----------------------------------------
        stage('Environment Verification') {
            steps {
                echo 'Checking installed development tools...'

                script {
                    if (isUnix()) {
                        sh '''
                            set -e
                            python3 --version
                            pip3 --version
                            node --version
                            npm --version
                            docker --version
                            docker compose version
                        '''
                    } else {
                        bat '''
                            @echo off
                            set "PATH=C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311;C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311\\Scripts;C:\\Program Files\\nodejs;C:\\Program Files\\Docker\\Docker\\resources\\bin;%PATH%"
                            where python >nul 2>&1 && python --version || py --version
                            where pip >nul 2>&1 && pip --version || py -m pip --version
                            node --version
                            npm --version
                            docker --version
                            docker compose version

                            if errorlevel 1 exit /b 1
                        '''
                    }
                }
            }
        }

        // -----------------------------------------
        // STAGE 3: BACKEND DEPENDENCIES
        // -----------------------------------------
        stage('Backend Dependency Installation') {
            steps {
                echo 'Installing Python backend dependencies...'

                script {
                    if (isUnix()) {
                        sh '''
                            set -e
                            python3 -m pip install \
                                -r backend/requirements.txt
                        '''
                    } else {
                        bat '''
                            @echo off
                            set "PATH=C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311;C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311\\Scripts;C:\\Program Files\\nodejs;C:\\Program Files\\Docker\\Docker\\resources\\bin;%PATH%"
                            where python >nul 2>&1 && (
                                python -m pip install -r backend\\requirements.txt
                            ) || (
                                py -m pip install -r backend\\requirements.txt
                            )
                            if errorlevel 1 exit /b 1
                        '''
                    }
                }
            }
        }

        // -----------------------------------------
        // STAGE 4: BACKEND TESTING
        // -----------------------------------------
        stage('Backend Unit & Integration Tests') {
            steps {
                echo 'Executing backend test suite...'

                script {
                    if (isUnix()) {
                        sh '''
                            set -e
                            mkdir -p reports

                            python3 -m pytest backend/tests \
                                -v \
                                --tb=short \
                                --junitxml=reports/backend-results.xml
                        '''
                    } else {
                        bat '''
                            @echo off
                            set "PATH=C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311;C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311\\Scripts;C:\\Program Files\\nodejs;C:\\Program Files\\Docker\\Docker\\resources\\bin;%PATH%"
                            if not exist reports mkdir reports

                            where python >nul 2>&1 && (
                                python -m pytest backend\\tests ^
                                    -v ^
                                    --tb=short ^
                                    --junitxml=reports\\backend-results.xml
                            ) || (
                                py -m pytest backend\\tests ^
                                    -v ^
                                    --tb=short ^
                                    --junitxml=reports\\backend-results.xml
                            )

                            if errorlevel 1 exit /b 1
                        '''
                    }
                }
            }
        }

        // -----------------------------------------
        // STAGE 5: FRONTEND DEPENDENCIES
        // -----------------------------------------
        stage('Frontend Dependency Installation') {
            steps {
                echo 'Installing React and Vite dependencies...'

                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh '''
                                set -e
                                npm install --no-audit --no-fund
                            '''
                        } else {
                            bat '''
                                @echo off
                                set "PATH=C:\\Program Files\\nodejs;%PATH%"
                                call npm install --no-audit --no-fund
                                if errorlevel 1 exit /b 1
                            '''
                        }
                    }
                }
            }
        }

        // -----------------------------------------
        // STAGE 6: FRONTEND BUILD
        // -----------------------------------------
        stage('Frontend Production Build') {
            steps {
                echo 'Creating optimized React production build...'

                dir('frontend') {
                    script {
                        if (isUnix()) {
                            sh 'npm run build'
                        } else {
                            bat '''
                                @echo off
                                set "PATH=C:\\Program Files\\nodejs;%PATH%"
                                call npm run build
                                if errorlevel 1 exit /b 1
                            '''
                        }
                    }
                }

                echo 'Frontend build completed.'
            }
        }

        // -----------------------------------------
        // STAGE 7: DOCKER VALIDATION
        // -----------------------------------------
        stage('Docker Compose Validation') {
            steps {
                echo 'Validating Docker Compose configuration...'

                script {
                    if (isUnix()) {
                        sh 'docker compose config -q'
                    } else {
                        bat '''
                            @echo off
                            docker compose config -q
                            if errorlevel 1 exit /b 1
                        '''
                    }
                }
            }
        }

        // -----------------------------------------
        // STAGE 8: DOCKER IMAGE BUILD
        // -----------------------------------------
        stage('Docker Image Build') {
            steps {
                echo 'Building application Docker images...'

                script {
                    if (isUnix()) {
                        sh '''
                            set -e
                            docker compose build
                        '''
                    } else {
                        bat '''
                            @echo off
                            docker compose build
                            if errorlevel 1 exit /b 1
                        '''
                    }
                }
            }
        }

        // -----------------------------------------
        // STAGE 9: BUILD SUMMARY
        // -----------------------------------------
        stage('Build Verification') {
            steps {
                echo 'All pipeline stages completed successfully.'

                script {
                    echo "Repository: Capstone-II"
                    echo "Commit: ${env.GIT_COMMIT_ID}"
                    echo "Build Number: ${env.BUILD_NUMBER}"
                    echo "Build URL: ${env.BUILD_URL}"
                }
            }
        }
    }

    // -----------------------------------------
    // POST BUILD ACTIONS
    // -----------------------------------------
    post {

        always {
            echo 'Jenkins pipeline execution finished.'

            junit(
                testResults: 'reports/backend-results.xml',
                allowEmptyResults: true
            )

            archiveArtifacts(
                artifacts: 'frontend/dist/**',
                allowEmptyArchive: true
            )
        }

        success {
            echo '''
            =====================================
                  CAPSTONE-II BUILD SUCCESS
            =====================================
            Backend Tests       : PASSED
            Frontend Build      : PASSED
            Docker Validation   : PASSED
            Docker Image Build  : PASSED
            =====================================
            '''
        }

        failure {
            echo '''
            =====================================
                  CAPSTONE-II BUILD FAILED
            =====================================
            Please inspect the Jenkins console
            output and identify the failed stage.
            =====================================
            '''
        }

        aborted {
            echo 'Pipeline execution was aborted.'
        }

        cleanup {
            echo 'Pipeline cleanup completed.'
        }
    }
}

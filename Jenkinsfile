// Capstone-II CI pipeline (Windows Jenkins agent, Linux also supported)
//
// Key rules for Windows `bat` steps (the cause of most earlier failures):
//   * Jenkins only reports the exit code of the LAST command in a bat script,
//     so every command is followed by `|| exit /b 1`.
//   * npm / npx are .cmd files: they must be started with `call`, otherwise the
//     batch script silently ends right after them.
//   * No `a && b || c` fallbacks: `c` also runs when `b` fails (e.g. tests run twice).

def run(String cmd) {
    if (isUnix()) {
        sh "set -e\n${cmd}"
    } else {
        bat "@echo off\r\n${cmd}"
    }
}

pipeline {
    agent any

    triggers {
        // Instant build when a GitHub webhook reaches Jenkins (needs a public URL)
        githubPush()
        // Fallback: Jenkins checks GitHub itself every ~2 minutes (works on localhost)
        pollSCM('H/2 * * * *')
    }

    options {
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
        // checkout is done explicitly in the first stage
        skipDefaultCheckout(true)
    }

    environment {
        CI = 'true'
        PYTHONUNBUFFERED = '1'
        PYTHONIOENCODING = 'utf-8'
        PIP_DISABLE_PIP_VERSION_CHECK = '1'
        PIP_NO_INPUT = '1'
        PATH = "C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311;C:\\Users\\divyansh\\AppData\\Local\\Programs\\Python\\Python311\\Scripts;C:\\Program Files\\nodejs;C:\\Program Files\\Docker\\Docker\\resources\\bin;${env.PATH}"
    }

    stages {

        stage('Source Code Checkout') {
            steps {
                checkout scm
                script {
                    try {
                        env.GIT_COMMIT_ID = isUnix()
                            ? sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                            : bat(script: '@git rev-parse --short HEAD', returnStdout: true).trim()
                    } catch (Exception e) {
                        env.GIT_COMMIT_ID = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'
                    }
                }
                echo "Building commit: ${env.GIT_COMMIT_ID}"
            }
        }

        stage('Environment Verification') {
            steps {
                script {
                    if (isUnix()) {
                        run('python3 --version\npip3 --version\nnode --version\nnpm --version\ndocker --version\ndocker compose version')
                    } else {
                        run('''python --version || exit /b 1
python -m pip --version || exit /b 1
call node --version || exit /b 1
call npm --version || exit /b 1
docker --version || exit /b 1
docker compose version || exit /b 1''')
                    }
                }
            }
        }

        stage('Backend Dependency Installation') {
            steps {
                script {
                    if (isUnix()) {
                        run('python3 -m pip install -r backend/requirements.txt')
                    } else {
                        run('python -m pip install -r backend\\requirements.txt || exit /b 1')
                    }
                }
            }
        }

        stage('Backend Unit & Integration Tests') {
            steps {
                script {
                    if (isUnix()) {
                        run('mkdir -p reports\npython3 -m pytest backend/tests -v --tb=short --junitxml=reports/backend-results.xml')
                    } else {
                        run('''if not exist reports mkdir reports
python -m pytest backend\\tests -v --tb=short --junitxml=reports\\backend-results.xml || exit /b 1''')
                    }
                }
            }
            post {
                always {
                    junit testResults: 'reports/backend-results.xml', allowEmptyResults: true
                }
            }
        }

        stage('Frontend Dependency Installation') {
            steps {
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            run('npm ci --no-audit --no-fund')
                        } else {
                            run('call npm ci --no-audit --no-fund || exit /b 1')
                        }
                    }
                }
            }
        }

        stage('Frontend Production Build') {
            steps {
                dir('frontend') {
                    script {
                        if (isUnix()) {
                            run('npm run build')
                        } else {
                            run('call npm run build || exit /b 1')
                        }
                    }
                }
            }
        }

        stage('Docker Compose Validation') {
            steps {
                script {
                    // docker-compose.yml needs .env (env_file) but .env is git-ignored,
                    // so it never exists in a fresh Jenkins workspace. Create it from the template.
                    if (isUnix()) {
                        run('[ -f .env ] || cp .env.example .env\ndocker info > /dev/null\ndocker compose config -q')
                    } else {
                        run('''if not exist .env copy /Y .env.example .env >nul
docker info >nul 2>&1 || (echo Docker daemon is not running - start Docker Desktop & exit /b 1)
docker compose config -q || exit /b 1''')
                    }
                }
            }
        }

        stage('Docker Image Build') {
            steps {
                script {
                    if (isUnix()) {
                        run('docker compose build')
                    } else {
                        run('docker compose build || exit /b 1')
                    }
                }
            }
        }

        stage('Build Verification') {
            steps {
                echo "Repository: Capstone-II | Commit: ${env.GIT_COMMIT_ID} | Build: #${env.BUILD_NUMBER}"
                echo "Build URL: ${env.BUILD_URL}"
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: true
        }
        success {
            echo 'CAPSTONE-II BUILD SUCCESS'
        }
        failure {
            echo 'CAPSTONE-II BUILD FAILED - check the failed stage in the console output.'
        }
        aborted {
            echo 'Pipeline execution was aborted.'
        }
    }
}

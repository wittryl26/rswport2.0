@echo off
echo Installing prerequisites and requirements...
python fix_requirements_install.py
if errorlevel 1 (
    echo Installation failed. Please check the error messages above.
    pause
    exit /b 1
)
echo Installation completed successfully!
pause

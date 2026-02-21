from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import engine, SessionLocal
from models import Base, User, Course, Grade

app = FastAPI()

# 8001 portunda çalışacağını bildiğimiz için CORS'u geniş tutuyoruz
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- SCHEMAS ---
class UserCreate(BaseModel):
    username: str; email: str; password: str # 🔥 Şifre eklendi

class UserLogin(BaseModel): # 🔥 Giriş için yeni şema
    email: str; password: str

class CourseCreate(BaseModel):
    name: str; description: str; user_id: int; credit: int

class GradeCreate(BaseModel):
    name: str; score: int; weight: int; course_id: int 

# --- ENDPOINTS ---
@app.get("/")
def read_root(): return {"message": "StudyTracker API Running 🚀"}

# KAYIT OL (Register)
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user: raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı!")
    # Gerçek projede şifreyi hashlemeliyiz ama şimdilik düz kaydediyoruz
    new_user = User(username=user.username, email=user.email, password=user.password)
    db.add(new_user); db.commit(); db.refresh(new_user)
    return new_user

# GİRİŞ YAP (Login)
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user: raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı!")
    if db_user.password != user.password: raise HTTPException(status_code=401, detail="Şifre yanlış!")
    return db_user

@app.get("/users") # Sadece test için kalsın
def get_users(db: Session = Depends(get_db)): return db.query(User).all()

@app.post("/courses")
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    new_course = Course(name=course.name, description=course.description, owner_id=course.user_id, credit=course.credit)
    db.add(new_course); db.commit(); db.refresh(new_course)
    return new_course

@app.get("/courses")
def get_courses(db: Session = Depends(get_db)): return db.query(Course).all()

@app.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    db.query(Grade).filter(Grade.course_id == course_id).delete()
    course = db.query(Course).filter(Course.id == course_id).first()
    if course: db.delete(course); db.commit()
    return {"message": "Silindi"}

@app.post("/grades")
def create_grade(grade: GradeCreate, db: Session = Depends(get_db)):
    new_grade = Grade(name=grade.name, score=grade.score, weight=grade.weight, course_id=grade.course_id)
    db.add(new_grade); db.commit(); db.refresh(new_grade)
    return new_grade

@app.get("/grades")
def get_grades(db: Session = Depends(get_db)): return db.query(Grade).all()

@app.delete("/grades/{grade_id}")
def delete_grade(grade_id: int, db: Session = Depends(get_db)):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if grade: db.delete(grade); db.commit()
    return {"message": "Not silindi"}
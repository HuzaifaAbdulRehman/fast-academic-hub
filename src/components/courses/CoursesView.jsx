import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import CourseCard from './CourseCard'
import CourseForm from './CourseForm'
import { Plus } from 'lucide-react'

export default function CoursesView() {
  const { courses } = useApp()
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      {/* Add Course Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <CourseForm
          onClose={() => setShowForm(false)}
          onSave={() => setShowForm(false)}
        />
      )}

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-content-secondary mb-4">
            No courses added yet
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}

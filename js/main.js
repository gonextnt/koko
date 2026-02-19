Vue.component('create-task', {
    template: `
      <form class="task-form" @submit.prevent="createTask">
        <div class="task-form__inner">
          <div class="task-name">
            <p>Создание заметки</p>
            <input class="task-form__input" id="title" type="text" v-model="title" placeholder="Название задачи">
          </div>
          <div class="create-task">
            <div class="create-task__form">
              <p>Пункты списка</p>
              <button
                  class="create-task__btn"
                  type="button"
                  v-if="subtasks.length < 5"
                  @click="addSubtask"
              >
                Добавить
              </button>
            </div>
            <div v-for="(subtask, i) in subtasks" :key="i">
              <input class="task-form__input" v-model="subtask.title" type="text" placeholder="Название пункта">
            </div>
          </div>
          <div v-if="errors.length" class="errors">
            <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
          </div>
          <button class="create-task__btn" :disabled="!canCreate">Создать заметку</button>
        </div>
      </form>
    `,
    props: {
        uniqueId: {
            type: Number,
            required: true,
        }
    },
    data(){
        return {
            title: '',
            subtasks: [],
            errors: []
        }
    },
    computed: {
        canCreate() {
            if (!this.title.trim()) return false
            if (this.subtasks.length < 3 || this.subtasks.length > 5) return false
            return this.subtasks.every(subtask => subtask.title.trim().length > 0)
        }
    },
    methods: {
        addSubtask() {
            this.subtasks.push({ title: '', completed: false })
        },
        createTask() {
            this.errors = []

            if (!this.title.trim()) {
                this.errors.push("Название задачи обязательно")
                return
            }

            if (this.subtasks.length < 3) {
                this.errors.push("Нужно добавить минимум 3 пункта")
                return
            }

            if (this.subtasks.length > 5) {
                this.errors.push("Максимум 5 пунктов")
                return
            }

            const emptySubtasks = this.subtasks.filter(subtask => !subtask.title.trim())
            if (emptySubtasks.length > 0) {
                this.errors.push("Все пункты должны быть заполнены")
                return
            }

            this.$emit('create-task', {
                id: this.uniqueId,
                title: this.title,
                subtasks: this.subtasks.map(s => ({ ...s })),
                finishedAt: null
            })

            this.title = ''
            this.subtasks = []
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        tasks: []
    },
    computed: {
        columns() {
            return [
                {
                    title: 'Новые',
                    tasks: this.filteredColumn(this.tasks, 0, 49)
                },
                {
                    title: 'В процессе',
                    tasks: this.filteredColumn(this.tasks, 50, 99)
                },
                {
                    title: 'Завершенные',
                    tasks: this.filteredColumn(this.tasks, 100, 100)
                },
            ]
        },
        uniqueId() {
            return this.tasks.length + 1
        }
    },
    methods: {
        filteredColumn(tasks, min, max) {
            return tasks.filter((task) => {
                const percentage = this.completedPercentage(task.subtasks)
                return percentage >= min && percentage <= max
            })
        },
        completedPercentage(subtasks) {
            return 100 * (subtasks.reduce((acc, subtask) => acc + +subtask.completed, 0) / (subtasks.length || 1))
        },
        onCompleteSubtask(task) {
            if (this.completedPercentage(task.subtasks) === 100) {
                task.finishedAt = new Date()
            }
        },
        columnDisabled(columnIndex) {
            if (columnIndex === 0) return this.columns[1].tasks.length >= 5
            if (columnIndex === 2) return true
            return false
        },
        addTask() {}
    },
    watch: {
        tasks: {
            handler(value) {
                localStorage.setItem('tasks', JSON.stringify(value))
            },
            deep: true
        }
    },
    mounted() {
        const savedTasks = localStorage.getItem('tasks')
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks)
        }
    }
})
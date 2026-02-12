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
                  @click="subtasks.push({ title: '', completed: false })"
              >
                Добавить
              </button>
            </div>
            <input class="task-form__input" v-for="(subtask, i) in subtasks" v-model="subtask.title" type="text" placeholder="Название пункта"></div>
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
            subtasks: []
        }
    },
    computed: {
        canCreate() {
            return this.title.length && this.subtasks.length >= 3 && this.subtasks.length <= 5
        }
    },
    methods: {
        createTask() {
            this.$emit('create-task', {
                id: this.uniqueId,
                title: this.title,
                subtasks: this.subtasks,
                finishedAt: null
            })

            this.title = ''
            this.subtasks = []
        }
    }
})

let app = new Vue({
    el: '#app',

    data() {
        return {
            tasks: []
        }
    },

    computed: {
        columns() {
            return [
                {
                    title: 'Новые',
                    tasks: this.filteredColumn(this.tasks, 0, 50)
                },
                {
                    title: 'В процессе',
                    tasks: this.filteredColumn(this.tasks, 51, 99)
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
            return 100 * (subtasks.reduce((acc, subtasks) => acc + +subtasks.completed, 0) / (subtasks.length || 1))
        },

        onCompleteSubtask(task) {
            if (this.completedPercentage(task.subtasks) === 100) {
                task.finishedAt = new Date()
            }
        },
        columnDisabled(columnIndex) {
            switch (columnIndex) {
                case 0: return this.columns[1].tasks.length >= 5
                case 2: return columnIndex === 2
            }
        }
    },


    watch: {
        tasks: {
            handler(value) {
                localStorage.tasks = JSON.stringify(value)
            },
            deep: true
        }
    },

    mounted() {
        this.columns = JSON.parse(localStorage.columns ?? JSON.stringify(
            {
                columnOne: [],
                columnTwo: [],
                columnThree: [],
            }))
    }
})
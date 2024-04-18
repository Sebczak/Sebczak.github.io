$(document).ready(function() {

    let apiRoot = 'http://localhost:8080/v1/tasks';
    let datatableRowTemplate = $('[data-datatable-row-template]').children()[0];
    let tasksContainer = $('[data-tasks-container]');

    // init
    getAllTasks();

    function createElement(data) {
        let element = $(datatableRowTemplate).clone();

        element.attr('data-task-id', data.id);
        element.find('[data-task-name-section] [data-task-name-paragraph]').text(data.title);
        element.find('[data-task-name-section] [data-task-name-input]').val(data.title);

        element.find('[data-task-content-section] [data-task-content-paragraph]').text(data.content);
        element.find('[data-task-content-section] [data-task-content-input]').val(data.content);

        return element;
    }

    function handleDatatableRender(data) {
        tasksContainer.empty();
        data.forEach(function(task) {
            createElement(task).appendTo(tasksContainer);
        });
    }

    function getAllTasks() {
        $.ajax({
            url: apiRoot,
            method: 'GET',
            success: handleDatatableRender
        });
    }

    function handleTaskUpdateRequest() {
        let parentEl = $(this).parent().parent();
        let taskId = parentEl.attr('data-task-id');
        let taskTitle = parentEl.find('[data-task-name-input]').val();
        let taskContent = parentEl.find('[data-task-content-input]').val();
        $.ajax({
            url: apiRoot,
            method: "PUT",
            processData: false,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify({
                id: taskId,
                title: taskTitle,
                content: taskContent
            }),
            success: function(data) {
                parentEl.attr('data-task-id', data.id).toggleClass('datatable__row--editing');
                parentEl.find('[data-task-name-paragraph]').text(taskTitle);
                parentEl.find('[data-task-content-paragraph]').text(taskContent);
            }
        });
    }

    function handleTaskDeleteRequest() {
        let parentEl = $(this).parent().parent();
        let taskId = parentEl.attr('data-task-id');
        $.ajax({
            url: apiRoot + '/' + taskId,
            method: 'DELETE',
            success: function() {
                parentEl.slideUp(400, function() { parentEl.remove(); });
            }
        })
    }

    function handleTaskSubmitRequest(event) {
        event.preventDefault();

        let taskTitle = $(this).find('[name="title"]').val();
        let taskContent = $(this).find('[name="content"]').val();

        $.ajax({
            url: apiRoot,
            method: 'POST',
            processData: false,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify({
                title: taskTitle,
                content: taskContent
            })
        });
    }

    function toggleEditingState() {
        let parentEl = $(this).parent().parent();
        parentEl.toggleClass('datatable__row--editing');

        let taskTitle = parentEl.find('[data-task-name-paragraph]').text();
        let taskContent = parentEl.find('[data-task-content-paragraph]').text();

        parentEl.find('[data-task-name-input]').val(taskTitle);
        parentEl.find('[data-task-content-input]').val(taskContent);
    }

    $('[data-task-add-form]').on('submit', handleTaskSubmitRequest);

    tasksContainer.on('click','[data-task-edit-button]', toggleEditingState);
    tasksContainer.on('click','[data-task-edit-abort-button]', toggleEditingState);
    tasksContainer.on('click','[data-task-submit-update-button]', handleTaskUpdateRequest);
    tasksContainer.on('click','[data-task-delete-button]', handleTaskDeleteRequest);
});
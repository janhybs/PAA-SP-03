(function () {
    var Main = {
    };

    var currentGroup = null;
    var currentTask = null;
    var groups = [];
    var currentSection = null;
    var imageData = null;
    var _isSupported = null;


    Main.init = function () {
        Database.init ();

        //# no local storage, no content
        if (!Database.isSupported ())
            return;


        //--------------------------------------------------------------------------------------------------------------

        $ ('#imageDrawNew').on ('click', function (e) {
            e.preventDefault ();
            Main.showDrawing ();
        });

        $ ('#imageClearNew').on ('click', function (e) {
            e.preventDefault ();
            $ ('#imageNew').hide ();
            $ ('#imageNew').attr ('src', "");
            imageData = null;
            $ ('#imageClearNew').hide ();
        });

        $ ('#imageDrawEdit').on ('click', function (e) {
            e.preventDefault ();
            Main.showDrawing ();
        });

        $ ('#imageClearEdit').on ('click', function (e) {
            e.preventDefault ();
            $ ('#imageEdit').hide ();
            $ ('#imageEdit').attr ('src', "");
            imageData = null;
            $ ('#imageClearEdit').hide ();
        });

        //--------------------------------------------------------------------------------------------------------------

        Main.loadGroups ();
    };

    Main.loadGroups = function () {
        var items = Database.getGroups ();
        //# if empty refresh and add default groups
        if (items === null || items.length === 0) {
            window.location.reload ();
            return;
        }
        
        //# adding group elements
        groups = [];
        var innerHTML = "", firstID = null;
        for (var i = 0, l = items.length; i < l; i++) {
            if (firstID === null)
                firstID = items[i].gid;
            innerHTML += Main.createGroupElement (items[i], i);
            groups.push (items[i].gid);
        }

        $ ("#groupList").html (l === 0 ? '<li class="empty">No groups</li>' : innerHTML);
        $ ("#groupList li .action").on ('click', Main.onGroupAction);

        registerAdvancedListeners ($ ("#groupList li a").find ());
        $ ("#groupList li a").on ('horizontalswipe', Main.onGroupAction);

        if (firstID !== null)
            Main.loadTasks (firstID);
    };


    Main.loadTasks = function (groupID) {
        Main.selectGroup (groupID);
        currentGroup = groupID;

        var tasks = Database.getGroupTasks (groupID);
        var innerHTML = '';
        for (var i = 0, l = tasks.length; i < l; i++)
            innerHTML += Main.createTaskElement (tasks[i], i);

        $ ("#taskList").html (l === 0 ? '<li class="empty">No Tasks</li>' : innerHTML);
        $ ("#taskList li .action").on ('click', Main.onTaskAction);

        registerAdvancedListeners ($ ("#taskList li a").find ());
        $ ("#taskList li a").on ('horizontalswipe', Main.onTaskAction);
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Main.onGroupAction = function (event) {
        Main.showEditGroupForm ($ (this.nodeName === "A" ? this : this.nextElementSibling).attr ('id').substring (('group-').length));
    };

    Main.onTaskAction = function (event) {
        Main.showEditTaskForm ($ (this.nodeName === "A" ? this : this.nextElementSibling).attr ('id').substring (('task-').length));
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Main.createGroupElement = function (group) {
        return '\
        <li>\
            <div>\
                <div class="action"></div>\
                <a href="#" onclick="Main.loadTasks (' + group.gid + ');" id="group-' + group.gid + '" class="">\
                    <h2>' + group.tit + '</h2>\
                    <p>' + group.des + '</p>\
                </a>\
            </div>\
        </li>';
    };

    Main.createTaskElement = function (task) {
        var imageData = Database.hasImage (task.tid) ? Database.getImage (task.tid) : null;
        var img = imageData === null ? '<img src="" style="display: none" />' : '<img src="' + imageData + '" />';
        return '\
        <li>\
            <div>\
                <div class="action"></div>\
                <a href="#" onclick="Main.invertTaskStatus(' + task.tid + ')" id="task-' + task.tid + '" class="' + (task.sta === 1 ? "complete" : "incomplete") + '">\
                    ' + img + '\
                    <h2>' + task.tit + '</h2>\
                    <p>' + task.des + '</p>\
                    <div style="clear: left" ></div>\
                </a>\
            </div>\
        </li>';
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Main.invertTaskStatus = function (taskID) {
        var task = Database.inverseTaskState (taskID);
        var item = document.getElementById ('task-' + taskID);
        item.setAttribute ('class', task.sta === 1 ? "complete" : "incomplete");
    };


    Main.selectGroup = function (groupID) {
        $ ('#groupList li').cls ("selected", "remove");
        $ ($ ('#group-' + groupID).find ().parentNode.parentNode).cls ("selected", "add");
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Main.showEditGroupForm = function (groupID) {
        Main.hideAllForms ();
        $ ("#editGroupForm").show ();
        currentSection = 'editGroup';

        var group = Database.getGroup (groupID);
        $ ('#editGroupID').val (groupID);

        $ ('#groupTitleEdit').val (group.tit);
        $ ('#groupDescriptionEdit').val (group.des);
    };

    Main.showEditTaskForm = function (taskID) {
        Main.hideAllForms ();
        $ ("#editTaskForm").show ();
        currentSection = 'editTask';
        currentTask = taskID;


        var hasImage = Database.hasImage (taskID);
        if (hasImage) {
            $ ('#imageClearEdit').show ();
            $ ('#imageEdit').show ();
            $ ('#imageEdit').attr ("src", imageData = Database.getImage (taskID));
        } else {
            $ ('#imageDrawClear').hide ();
            imageData = null;
        }


        var task = Database.getTask (taskID);
        $ ('#editTaskID').val (taskID);

        $ ('#taskTitleEdit').val (task.tit);
        $ ('#taskDescriptionEdit').val (task.des);
        $ ('#taskStateEdit').find ().value = task.sta;


        var groups = Database.getGroups ();
        var innerHTML = "";
        for (var i = 0, l = groups.length; i < l; i++)
            innerHTML += '<option value="' + groups[i].gid + '">' + groups[i].tit + '</option>';

        $ ("#groupIDEdit").html (innerHTML);
        $ ('#groupIDEdit').find ().value = task.gid;
    };

    Main.showNewTaskForm = function () {
        Main.hideAllForms ();
        $ ("#newTaskForm").show ();
        currentSection = 'newTask';

        var groups = Database.getGroups ();
        var innerHTML = "";
        for (var i = 0, l = groups.length; i < l; i++)
            innerHTML += '<option value="' + groups[i].gid + '">' + groups[i].tit + '</option>';

        $ ("#groupIDNew").html (innerHTML);
        $ ('#groupIDNew').find ().value = currentGroup;
    };

    Main.showNewGroupForm = function () {
        Main.hideAllForms ();
        $ ("#newGroupForm").show ();
        currentSection = 'newGroup';
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Main.hideNewTaskForm = function () {
        $ ("#newTaskForm").hide ();
    };

    Main.hideNewGroupForm = function () {
        $ ("#newGroupForm").hide ();
    };

    Main.hideEditTaskForm = function () {
        $ ("#editTaskForm").hide ();
    };

    Main.hideEditGroupForm = function () {
        $ ("#editGroupForm").hide ();
    };

    Main.hideAllForms = function () {
        Main.hideNewTaskForm ();
        Main.hideNewGroupForm ();
        Main.hideEditTaskForm ();
        Main.hideEditGroupForm ();
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Main.addNewTaskFromForm = function () {
        var task,
                tit = $ ('#taskTitleNew').val (),
                des = $ ('#taskDescriptionNew').val (),
                sta = $ ('#taskStateNew').val (),
                gid = $ ('#groupIDNew').val ();

        if (tit.isEmpty ()) {
            $ ('#taskTitleNew').find ().focus ();
            return alert ('Please fill task title');
        }


        task = Database.addTask (tit, des, sta, gid);
        if (imageData !== null) {
            Database.setImage (task.tid, imageData);
        }

        Main.hideNewTaskForm ();
        Main.loadTasks (gid);
        imageData = null;
    };


    Main.addNewGroupFromForm = function () {
        var group,
                tit = $ ('#groupTitleNew').val (),
                des = $ ('#groupDescriptionNew').val ();

        if (tit.isEmpty ()) {
            $ ('#groupTitleNew').find ().focus ();
            return alert ('Please fill group title');
        }

        var group = Database.addGroup (tit, des);

        Main.hideNewGroupForm ();
        Main.loadGroups ();
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Main.editGroupFromForm = function () {
        var group,
                gid = $ ('#editGroupID').val (),
                tit = $ ('#groupTitleEdit').val (),
                des = $ ('#groupDescriptionEdit').val ();

        if (tit.isEmpty ()) {
            $ ('#groupTitleEdit').find ().focus ();
            return alert ('Please fill group title');
        }

        group = Database.editGroup (gid, tit, des);

        Main.hideEditGroupForm ();
        Main.loadGroups ();
    };


    Main.editTaskFromForm = function () {
        var task,
                tid = $ ('#editTaskID').val (),
                tit = $ ('#taskTitleEdit').val (),
                des = $ ('#taskDescriptionEdit').val (),
                sta = $ ('#taskStateEdit').val (),
                gid = $ ('#groupIDEdit').val ();

        if (tit.isEmpty ()) {
            $ ('#taskTitleEdit').find ().focus ();
            return alert ('Please fill task title');
        }

        task = Database.editTask (tid, tit, des, sta, gid);

        if (imageData !== null)
            Database.setImage (tid, imageData);
        else
            Database.deleteImage (tid);

        Main.hideEditTaskForm ();
        Main.loadTasks (currentGroup);
        imageData = null;
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Main.deleteGroup = function () {
        var groupID = $ ('#editGroupID').val ();
        if (groupID.length === 0)
            return;

        Database.deleteGroup (groupID);
        Main.hideEditGroupForm ();
        Main.loadGroups ();
    };

    Main.deleteTask = function () {
        var taskID = $ ('#editTaskID').val ();
        if (taskID.length === 0)
            return;

        Database.deleteTask (taskID);
        Main.loadTasks (currentGroup);
        Main.hideEditTaskForm ();
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Main.prevGroup = function () {
        var index = groups.indexOf (currentGroup);
        if (index === 0)
            index = groups.length;
        Main.loadTasks (groups[index - 1]);
    };

    Main.nextGroup = function () {
        var index = groups.indexOf (currentGroup);
        if (index === groups.length - 1)
            index = -1;
        Main.loadTasks (groups[index + 1]);
    };


    Main.showDrawing = function () {
        $ ('#Drawing').show ();
        Drawing.clearCanvas ();

        if (currentSection === 'editTask')
            $ ('#editTaskForm').hide ();
        else if (currentSection === 'newTask')
            $ ('#newTaskForm').hide ();
    };

    Main.hideDrawing = function (attach) {
        $ ('#Drawing').hide ();
        if (currentSection === 'editTask')
            $ ('#editTaskForm').show ();
        else if (currentSection === 'newTask')
            $ ('#newTaskForm').show ();


        //# cancel
        if (attach === false) {
            switch (currentSection) {
                case 'editTask':
                    if (imageData === null) {
                        $ ('#imageEdit').hide ();
                        $ ('#imageEdit').attr ('src', "");
                        $ ('#imageClearEdit').hide ();
                    } else {
                        $ ('#imageEdit').show ();
                        $ ('#imageEdit').attr ('src', imageData);
                        $ ('#imageClearEdit').show ();
                    }
                    break;
                case 'newTask':
                    $ ('#imageNew').hide ();
                    $ ('#imageNew').attr ('src', "");
                    imageData = null;
                    break;
            }

            //# attach
        } else if (attach === true) {
            switch (currentSection) {
                case 'editTask':
                    imageData = Drawing.getImageData ();
                    $ ('#imageEdit').show ();
                    $ ('#imageEdit').attr ('src', imageData);
                    $ ('#imageClearEdit').show ();
                    break;
                case 'newTask':
                    imageData = Drawing.getImageData ();
                    $ ('#imageNew').show ();
                    $ ('#imageNew').attr ('src', imageData);
                    $ ('#imageClearNew').show ();
                    break;
            }
        }
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Main.export = function () {
        var exportImages = confirm ("Do you also want to export images? (It may take a while...)");
        var a = document.createElement ("a");
        a.href = Database.export (exportImages);
        a.innerHTML = "export";
        a.click ();
    };

    Main.import = function () {
        var input = document.createElement ('input');
        input.type = 'file';
        document.body.appendChild (input);

        input.addEventListener ('change', function (event) {
            console.log (event);
            var files = evt.target.files;
            var file = files && files.length > 0 ? files[0] : null;

            if (file === null) {
                alert ('choose some file');
            } else {
                var start = 0;
                var stop = file.size - 1;

                var reader = new FileReader ();
                reader.onloadend = function (e) {
                    if (e.target.readyState === FileReader.DONE) {
                        Database.import (e.target.result);
                    }
                };

                var blob = file.slice (start, stop + 1);
                reader.readAsBinaryString (blob);
            }


            document.body.removeChild (input);
        }, false);

        var evt = document.createEvent ("MouseEvents");
        evt.initEvent ("click", true, false);
        input.dispatchEvent (evt);
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    window.Main = Main;
}) ();


//# capabilities
(function () {
    var Capabilities = {
    };
    var features = ['drawing', 'database', 'import', 'export'];

    Capabilities.isSupported = function (feature) {


        if (feature === undefined || feature === null) {
            for (var i = 0; i < features.length; i++) {
                console.log (features[i] + ': ' + Capabilities.isSupported (features[i]));
            }
            return false;
        }

        switch (feature.toLowerCase ()) {
            case 'drawing':
                return Drawing.isSupported ();
            case 'database':
                return Database.isSupported ();
            case 'import':
                return false;
            case 'export':
                return false;
        }
        return false;
    };

    Capabilities.fix = function (feature) {
        if (!Capabilities.isSupported (feature)) {
            $ ('[data-require=' + feature + ']').hide ();
            $ ('[data-require=' + feature + '-placeholder]').show ();
        } else {
            $ ('[data-require=' + feature + ']').show ();
            $ ('[data-require=' + feature + '-placeholder]').hide ();
        }
    };

    window.Capabilities = Capabilities;
    Capabilities.isSupported (null);
}) ();


(function () {
    var longPressIntID = null;
    var swipeDownPosition = null;
    var swipeDownTarget = null;

    function registerAdvancedListeners (elements) {
        if (elements === false)
            return;

        if (!elements.length)
            return registerAdvancedListeners ([elements]);

        var element;
        for (var i = 0, l = elements.length; i < l; i++) {
            element = elements[i];
            element.addEventListener ('mouseup', function (event) {
                event.preventDefault ();
                clearTimeout (longPressIntID);
                if (swipeDownTarget === this) {
                    var
                            x = Math.abs (swipeDownPosition.x - event.x),
                            y = Math.abs (swipeDownPosition.y - event.y);
                    if (x > 100 && x > y * 3) {
                        this.dispatchEvent (
                                new CustomEvent ("horizontalswipe",
                                {
                                    bubbles: true,
                                    cancelable: false
                                }));
                    }
                    swipeDownTarget = null;
                    swipeDownPosition = null;
                }
            }, false);

            element.addEventListener ('mousedown', function (event) {
                event.preventDefault ();
                clearTimeout (longPressIntID);
                swipeDownPosition = {x: event.x, y: event.y};
                swipeDownTarget = this;
                longPressIntID = setTimeout (function (target) {
                    target.dispatchEvent (
                            new CustomEvent ("longpress",
                            {
                                bubbles: true,
                                cancelable: false
                            }));
                }, 500, this);
            });
        }

        return;
    }

    window.registerAdvancedListeners = registerAdvancedListeners;
}) ();
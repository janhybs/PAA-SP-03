var VERSION = 1.0;

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

Storage.prototype.setObject = function (key, value) {
    localStorage.setItem (key, JSON.stringify (value));
    return value;
};

Storage.prototype.getObject = function (key) {
    return JSON.parse (localStorage.getItem (key));
};

Storage.prototype.hasItem = function (key) {
    return this.hasOwnProperty (key) && this.getItem (key) !== null;
};

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

String.prototype.isEmpty = function () {
    String.prototype.white = /^\s*$/g;
    return this.length === 0 || this.white.test (this);
};

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

Array.prototype.findByID = function (key, ID) {
    var sID = String (ID);
    var nID = Number (ID);

    for (i = 0; i < this.length; i++) {
        if (this[i][key] === sID || this[i][key] === nID)
            return i;
    }
    return -1;
};

Array.prototype.findAllByID = function (key, ID) {
    var sID = String (ID);
    var nID = Number (ID);
    var result = [];
    for (i = 0; i < this.length; i++) {
        if (this[i][key] === sID || this[i][key] === nID)
            result.push (this[i]);
    }
    return result;
};

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

(function () {
    var _isSupported = null;
    var Database = {
        taskAttrs: ["id", "title", "description", "state", "groupID"],
        groupAttrs: ["id", "title", "description"],
        autoInc: ["groupID", "taskID"]
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Database.init = function () {
        if (!Database.isSupported ())
            return;

        if (!localStorage.hasItem ("autoInc")
                || (!localStorage.hasItem ("version") || localStorage.getItem ('version') < VERSION)
                || (Database.getGroups ().length === 0)) {
            Database.firstTime ();
        }
    };


    Database.isSupported = function () {
        if (_isSupported === null) {
            var uid = "check" + Math.random (), result;
            try {
                localStorage.setItem (uid, uid);
                result = localStorage.getItem (uid) === uid;
                localStorage.removeItem (uid);
                _isSupported = result && localStorage !== null && localStorage !== undefined;
            } catch (e) {
                _isSupported = false;
            }
        }

        return _isSupported;
    };


    Database.firstTime = function () {
        Database.clear ();
        console.log ('Database creation');
        localStorage.setObject ("autoInc", {groupID: 0, taskID: 0});
        localStorage.setObject ("tasks", []);
        localStorage.setObject ("groups", []);
        localStorage.setItem ('version', VERSION);

        Database.addGroup ('Hlavní skupina', 'Ty nejdůležitější úkoly');
        Database.addTask ('Váš první úkol!', 'V každé skupině může být mnoho úkolů. <br />kliknutím na tento text, označíte úkol za splněný', -1, 0);
        Database.addTask ('Váš druhý úkol!', 'Smazání nebo jinou úpravu úkolu, provedete kliknutím na ikonu vpravo', -1, 0);
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Database.addTask = function (title, description, state, groupID, taskID) {
        var task;
        var newID = taskID || Database.incTaskID ();
        var array = Database.getTasks ();
        array.push (task = Task (title, description, Number (state), groupID, newID));
        Database.setTasks (array);
        return task;
    };


    Database.editTask = function (taskID, title, description, state, groupID) {
        var array = Database.getTasks ();
        var index = array.findByID ("tid", taskID);
        if (index === -1)
            return null;

        var task = array[index];
        task.tit = title === undefined ? task.tit : title;
        task.des = description === undefined ? task.des : description;
        task.sta = Number (state === undefined ? task.sta : state);
        task.gid = groupID === undefined ? task.gid : groupID;
        array[index] = task;
        Database.setTasks (array);
        return task;
    };

    Database.getTask = function (taskID) {
        var array = Database.getTasks ();
        var index = array.findByID ("tid", taskID);
        if (index === -1)
            return null;
        return array[index];
    };

    Database.inverseTaskState = function (taskID) {
        var task = Database.getTask (taskID);
        if (task === null)
            return null;

        return Database.editTask (taskID, undefined, undefined, Number (task.sta) * -1);
    };

    Database.deleteTask = function (taskID) {
        var tasks = Database.getTasks ();
        var index = tasks.findByID ("tid", taskID);
        if (index === -1)
            return null;

        tasks.splice (index, 1);
        localStorage.removeItem ('image-' + taskID);
        Database.setTasks (tasks);
        return tasks;
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Database.addGroup = function (title, description, groupID) {
        var group;
        var newID = groupID || Database.incGroupID ();
        var array = Database.getGroups ();
        array.push (group = Group (title, description, newID));
        Database.setGroups (array);
        return group;
    };

    Database.editGroup = function (groupID, title, description) {
        var array = Database.getGroups ();
        var index = array.findByID ("gid", groupID);
        if (index === -1)
            return null;

        var item = array[index];
        item.tit = title === undefined ? item.tit : title;
        item.des = description === undefined ? item.des : description;
        array[index] = item;
        Database.setGroups (array);
        return item;
    };

    Database.getGroup = function (groupID) {
        var array = Database.getGroups ();
        var index = array.findByID ("gid", groupID);
        if (index === -1)
            return null;
        return array[index];
    };


    Database.deleteGroup = function (groupID) {
        var groups = Database.getGroups ();
        var tasks = Database.getGroupTasks (groupID);
        var index = groups.findByID ("gid", groupID);
        if (index === -1)
            return null;


        //# deleting tasks
        for (var i = 0, l = tasks.length; i < l; i++)
            Database.deleteTask (tasks[i].tid);

        groups.splice (index, 1);
        Database.setGroups (groups);
        return groups;
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Database.getGroupTasks = function (groupID) {
        var array = Database.getTasks ();
        return array.findAllByID ("gid", groupID);
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Database.clear = function () {
        localStorage.clear ();
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Database.setImage = function (taskID, imageData) {
        localStorage.setItem ('image-' + taskID, imageData);
    };

    Database.deleteImage = function (taskID) {
        localStorage.removeItem ('image-' + taskID);
    };

    Database.getImage = function (taskID) {
        return localStorage.getItem ('image-' + taskID);
    };

    Database.hasImage = function (taskID) {
        return localStorage.hasItem ('image-' + taskID);
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Database.incTaskID = function () {
        return Database.incID ("taskID");
    };

    Database.incGroupID = function () {
        return Database.incID ("groupID");
    };

    Database.incID = function (key) {
        var obj = localStorage.getObject ("autoInc");
        var id = obj[key];
        obj[key] = id + 1;
        localStorage.setObject ("autoInc", obj);
        return id;
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Database.setImage = function (taskID, imageData) {
        localStorage.setItem ('image-' + taskID, imageData);
    };

    Database.deleteImage = function (taskID) {
        localStorage.removeItem ('image-' + taskID);
    };

    Database.getImage = function (taskID) {
        return localStorage.getItem ('image-' + taskID);
    };

    Database.hasImage = function (taskID) {
        return localStorage.hasItem ('image-' + taskID);
    };


//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Database.getTasks = function () {
        return localStorage.getObject ("tasks");
    };

    Database.setTasks = function (array) {
        return localStorage.setObject ("tasks", array);
    };

    Database.getGroups = function () {
        return localStorage.getObject ("groups");
    };

    Database.setGroups = function (array) {
        return localStorage.setObject ("groups", array);
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    Database.export = function (exportImages) {
        var result = {};
        for (var i = 0, l = localStorage.length, p; i < l; i++) {
            p = localStorage.key (i);
            if (!exportImages && !!~p.indexOf ('image-'))
                continue;
            result[p] = localStorage.getItem (p);
        }
        return "data:application/x-json;base64," + escape (Base64.encode (JSON.stringify (result)));
    };

    Database.import = function (data) {
        Database.clear ();
        var obj = JSON.parse (unescape (data));
        for (var p in obj)
            localStorage[p] = obj[p];
    };

//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

    window.Database = Database;
}) ();

//----------------------------------------------------------------------------------------------------------------------

function Task (_title, _description, _state, _groupID, _taskID) {
    return {
        "tid": _taskID || 0,
        "gid": _groupID || 0,
        "tit": _title,
        "des": _description,
        "sta": _state
    };
}

function Group (_title, _description, _groupID) {
    return {
        "gid": _groupID || 0,
        "tit": _title,
        "des": _description
    };
}
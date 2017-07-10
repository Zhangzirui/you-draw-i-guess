import path from 'path';
import fs from 'fs';

const dataPath = path.join(__dirname, '../data/');

let nameList,
    nameIndex = 0,
    guessList,
    guessIndex = 0,    // 所画题目的索引
    drawUserIndex = 0, // 画画人的索引
    onlineUserList = [],
    canvasImgs = [],
    endTime;

(function () {
    let fileToArray = compose(randomArray, splitRow, readFile),
        getName = compose(curry(map)(encode), curry(filter)(notNull), fileToArray),
        getGuess = compose(curry(map)(splitColon), curry(map)(encode), curry(filter)(notNull), fileToArray);
    nameList = getName(path.join(dataPath, 'name'));
    guessList = getGuess(path.join(dataPath, 'guess'));
})();


/**
 * 用户登录时触发
 * 若onlineUserList不存在该用户，则为其分配name, index, identify
 * 若已存在该用户，则将该用户取出，且将其登录状态置1，表示在线
 *
 * @return {Object} 返回处理后的对象
 */
let dealUserData = function (data)　{
    // 如果用户名存在于 onlineUserList 中，则用户是掉线后重新登录的，更改用户的状态
    let result = onlineUserList.filter(item => {
        if (item.name === data.name) {
            item.status = item.status - 1;
            return item;
        }
    });
    let len = result.length;

    if (len === 0) {    // 用户是第一次登陆
        data.name = nameList[nameIndex++];
        data.index = onlineUserList.length;
        onlineUserList.push(data);
    } else if (len === 1) {
        data = result[0];   // 用户是重新登录
    } else {
        console.log('出现同名');    // 系统出错
    }

    if (data.index === 0) {
        data.identity = 'master';
    }

    return data;
};

// 用户换座位时，调整userList
let sortUserList = function (user) {
    onlineUserList = onlineUserList.map(item => {
        console.log(item);
        item.identity = 'guest';
        if (item.id === user.id) {
            item.index = user.index;
        }
        if (item.index === 0) {
            item.identity = 'master';
        }
        console.log(item);
        return item;
    });
    onlineUserList.sort((a, b) => a.index - b.index);
};

let changeUserListStatus = function () {
    if (onlineUserList.length === 0) {
        return;
    }
    // 进入游戏，更改所有用户状态
    onlineUserList.map((item, index) => {
        if (item.status === 0) {
            item.status = 2;
        }
    });
};

let single_changeUserList = singleton(changeUserListStatus);

let changeUserStatus = function () {
    // 没有进入游戏的用户将无法画画
    while (onlineUserList[drawUserIndex] && onlineUserList[drawUserIndex].status === 1) {
        drawUserIndex++;
    }
    console.log(onlineUserList);
    console.log(drawUserIndex);
    drawUserIndex = drawUserIndex >= onlineUserList.length ? 0 : drawUserIndex;
    onlineUserList[drawUserIndex++].status = 4;
    console.log(onlineUserList);
};

let getGuessTitle = function () {
    return guessList[guessIndex++];
};

let deleteUserData = function (data) {
    onlineUserList = onlineUserList.filter(item => item.id !== data.id);
};

let leaveUserData = function (data) {
    // 用户离线，更改用户状态
    onlineUserList = onlineUserList.map(item => {
        if (item.name === data.name) {
            item.status = item.status + 1;
        }
        return item;
    })
};

let setCanvasImgs = function (imgUrl) {
    canvasImgs.push(imgUrl);
};

let setEndTime = function (value) {
    endTime = value;
};

let getGameMsg = function () {
    return {
        'endTime': endTime,
        'guessTitle': guessList[guessIndex - 1],
        'canvasImgs': canvasImgs
    };
};

export {
    onlineUserList,
    dealUserData,
    leaveUserData,
    sortUserList,
    getGuessTitle,
    single_changeUserList,
    changeUserStatus,
    getGameMsg,
    setCanvasImgs,
    setEndTime
};





/******************辅助函数******************/

function map (fn, arr) {
    return arr.map(fn);
}

function filter (fn, arr) {
    return arr.filter(fn);
}

function singleton (fn) {
    let result = null;
    return function (...rest) {
        return result || (result = fn.apply(null, rest));
    };
}

function readFile (filePath) {
    return fs.readFileSync(filePath, 'utf-8')
}

function randomArray (arr) {
    return arr.sort(() => Math.random() > 0.5 ? 1 : -1);
}

function splitRow (str) {
    return str.split('\n');
}

function splitColon (str) {
    return str.split(/[:|：]/);
}

function encode (str) {
    return encodeURI(str);
}

function notNull (str) {
    return str !== '' && str !== null && str !== undefined;
}

function compose (...fnList) {
    let fns = fnList,
        len = fns.length;
    return function (...rest) {
        let args = rest,
            nextArgs;
        for (let i = len - 1; i >= 0; i--) {
            let fn = fnList[i];
            nextArgs = [];
            nextArgs.push(fn.apply(this, args));
            args = nextArgs;
        }
        return nextArgs[0];
    }
}

function curry (fn) {
    let len = fn.length,
        args = [];
    return function curried (...rest) {
        args = args.concat(rest);
        if (args.length < len) {
            return curried;
        }
        return fn.apply(this, args);
    };
}

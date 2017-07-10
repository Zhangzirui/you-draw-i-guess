import {onlineUserList} from './dataModel';

export default {
    login (data) {
        onlineUserList.push(data);
    }
}

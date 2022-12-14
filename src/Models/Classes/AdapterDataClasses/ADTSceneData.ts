import { IAdapterData } from '../../Constants/Interfaces';
import { IScene } from '../../Types/Generated/3DScenesConfiguration-v1.0.0';

class ADTSceneData implements IAdapterData {
    data: IScene;

    constructor(data: IScene) {
        this.data = data;
    }

    hasNoData() {
        return this.data === null || this.data === undefined;
    }
}

export default ADTSceneData;

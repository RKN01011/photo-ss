import React from 'react';

export default class ImgInput extends React.Component {
    constructor() {
        super();
        this.changePhotoHandler = this.changePhotoHandler.bind(this);
    }

    _input = React.createRef();

    changePhotoHandler(e, v) {
        const [file] = e.target.files;
        this.props.photoChangeHandler(file);
    }

    render() {
        return (
            <input ref={this._input} id="img_input" type="file" accept=".jpeg, .png, .jpg"
                onChange={this.changePhotoHandler}/>
        );
    }
}
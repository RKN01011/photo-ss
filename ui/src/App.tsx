import React, {useState, useEffect, ReactElement} from 'react';

import ImgInput from './components/imgInput';

import Button from 'react-bootstrap/Button';

import Container from 'react-bootstrap/Container';

import './App.css';

const SOURCE = 'http://188.68.223.48:8000';

const REG_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}/i;

interface IState {
    data: any[];
    text: string;

    photoFile: Blob;
}
export default class Example extends React.Component<{}, IState> {

    protected _eventSource = null;

    protected _photoIds = [];

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            text: '',
            photoFile: null
        };

        this.completeWorkWithPhotoHandler = this.completeWorkWithPhotoHandler.bind(this);
        this.photoChangeHandler = this.photoChangeHandler.bind(this);
        this.eventHandler = this.eventHandler.bind(this);
        this.sendPhoto = this.sendPhoto.bind(this);
    }

    componentDidMount() {
        if (!this._eventSource) {
            this._eventSource = new EventSource(`${SOURCE}/stream`);
            this._eventSource.onmessage = this.eventHandler;
        }
    }

    protected eventHandler({data}) {
        if (data) {
            const ids = REG_PATTERN.exec(data);
            this._photoIds = this._photoIds.filter((photoId) => {
                if (ids.includes(photoId)) {
                    fetch(`${SOURCE}/get_photo?photo_id=${photoId}`)
                        .then((response) => response.blob())
                            .then(this.completeWorkWithPhotoHandler)

                    return false;
                }

                return true;
            });
        }
    }

    protected completeWorkWithPhotoHandler(photoFile: Blob): void {
        this.setState({photoFile});
    }

    protected photoChangeHandler(photoFile) {
        this.setState({photoFile});
    }


    protected async sendPhoto() {
        const photoFile = this.state.photoFile;

        const data = new FormData();
        data.append('image', photoFile);

        fetch(
            `${SOURCE}/send_photo/`,
            {
                method: 'POST',
                credentials: 'same-origin',
                body: data,
                headers: {accept: 'application/json'}
            }
        )
            .then((response) => response.json())
                .then((data) => this._photoIds.push(data.id));
    }

    protected _renderPhoto(): ReactElement | string {
        if (this.state.photoFile) {
            const url = URL.createObjectURL(this.state.photoFile);

            return (
                <img alt="" src={url}/>
            );

        }

        return '';
    }

    render() {
        return (
            <Container className="App">
                <Container className="App__Top">
                    <div className="App__Top_dialog">
                        {this._renderPhoto()}
                    </div>
                </Container>
                <Container className="App__Bottom">
                    <div className="App__Bottom_inputs">
                        <ImgInput photoChangeHandler={this.photoChangeHandler} />
                        <Button style={{width: '100px', height: '100px'}} onClick={this.sendPhoto}/>
                    </div>
                </Container>
            </Container>
        );
    }
}
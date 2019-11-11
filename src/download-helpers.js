import React from 'react';

export function download(filename, text) {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function getSafeFileName(string) {
    return string.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export class JSONDownloadButton extends React.Component {
    downloadJSON() {
        let downloadInfo = this.props.getDownloadInfo();
        download(getSafeFileName(downloadInfo.filename)+".json", JSON.stringify(downloadInfo.data));
    }

    render() {
        return(
            <button onClick={()=>this.downloadJSON()} className={this.props.className}>
                {this.props.title}
            </button>
        );
    }
}

export class JSONUploadButton extends React.Component {
    handleUpload() {
        let fr = new FileReader();
        fr.readAsText(document.getElementById(this.props.id).files[0]);
        fr.onload = function(oFREvent) {
            this.props.handleJSON(JSON.parse(oFREvent.target.result));
            document.getElementById(this.props.id)
        }.bind(this);
    }

    render() {
        return(
            <span className="control">
                <span className="file is-small">
                    <label className="file-label">
                        <input
                            type="file"
                            id={this.props.id}
                            className="file-input"
                            onChange={()=>this.handleUpload()}
                        />
                        <span className="file-cta">
                            <span className="file-icon">
                                <i className="fas fa-upload"></i>
                            </span>
                            <span className="file-label">
                                Choose a file...
                            </span>
                        </span>
                    </label>
                </span>
            </span>
        )
    }
}
import './App.css';
import React from 'react';
import Register from './components/Register/Register'
import SignIn from './components/SignIn/SignIn'
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ParticlesBg from 'particles-bg'

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box: {},
      route: `signin`,
      isSignedIn: false,
      user: {
        id: "",
        name: "",
        email: "",
        password: "",
        entries: 0,
        joined: ""
      }
    }
  }

  updateUser = data => {
    console.log("Updating user"); 
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        entries: data.entries,
        joined: data.joined
    }})
  }

  handleInputChange = (event) => {
    this.setState({ input: event.target.value });
  }
  
  calculateFaceLocation = (result) => {
    console.log(result);
    const obj = JSON.parse(result).outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.querySelector("#inputChange");
    const width = Number(image.width);
    console.log(image.height)
    const height = Number(image.height);
  
    const boxProperties = {
      leftCol: obj.left_col * width,
      topRow: obj.top_row * height,
      rightCol: width - obj.right_col * width,
      bottomRow: height - obj.bottom_row * height
    }

    console.log("From Calculate:", boxProperties);
    return boxProperties;
  }

  setBoxProperties = (box) => {
    this.setState({box});
    console.log("From state:", this.state.box);
  }


  handlePictureSubmit = () => {
    this.setState({ imageURL: this.state.input });

    // URL of image to use. Change this to your image.
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // In this section, we set the user authentication, user and app ID, model details, and the URL
    // of the image we want as an input. Change these strings to run your own example.
    //////////////////////////////////////////////////////////////////////////////////////////////////

    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = 'e935d75a7f7b484ca16c405159ac246a';
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = `q9wgqj7g32kn`;
    const APP_ID = 'FDP_V';
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = 'face-detection';
    // URL of image to use. Change this to your image.
    const IMAGE_URL = 'https://linuxpmf.pmf.ni.ac.rs/upload/zaposleni/slike/z_440.jpg';

    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "url": this.state.imageURL
            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
      },
      body: raw
    };

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`, requestOptions)
      .then(response => response.text())
      .then(result => {
        if (result) {
          this.setBoxProperties(this.calculateFaceLocation(result));

          fetch("http://localhost:3001/image", {
            method: "put",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(entriesCount => {
              this.setState({ user: Object.assign(this.state.user, { entries: entriesCount }) })
            })

          
        }
        
      })
      .catch(error => console.log('error', error));
  }

  changeRoute = (route) => {
    if (route === "home")
      this.setState({ isSignedIn: true })
    else 
      this.setState({ isSignedIn: false })

    this.setState({ route });
  }

  render() {
    return (
      <>
        <div className="App">
          <ParticlesBg type="cobweb" bg={true} color='#ffffff' num={150} />
          <Navigation
            changeRoute={this.changeRoute}
            isSignedIn={this.state.isSignedIn}/>
          {
            this.state.route !== "home" 
            ? (
              this.state.route === "signIn" ?
                <SignIn
                    changeRoute={this.changeRoute}
                    updateUser={this.updateUser}/>
                  : <Register 
                    changeRoute={this.changeRoute}
                    updateUser={this.updateUser} />
            ) :
            <>
                <Rank
                  userName={this.state.user.name}
                  userEntries={this.state.user.entries}/>
              <Logo />
          <ImageLinkForm
            handleInputChange={this.handleInputChange}
            handlePictureSubmit={this.handlePictureSubmit} />
          <FaceRecognition
            imageSource={this.state.imageURL}
            boxProperties={this.state.box} />
            </>
          }
          
        </div>
      </>
    );

  }
}
export default App;

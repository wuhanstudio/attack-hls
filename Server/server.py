from flask import Flask
from flask_restful import reqparse,Resource, Api
from flask_cors import CORS
import base64
from flask import jsonify

from PIL import Image
import numpy as np
import keras
# from keras.models import load_model
import tensorflow as tf
from tensorflow.python.keras.backend import set_session
from tensorflow.python.keras.models import load_model

from io import BytesIO

# IMPORTANT: models have to be loaded AFTER SETTING THE SESSION for keras! 
# Otherwise, their weights will be unavailable in the threads after the session there has been set
sess = tf.Session()
set_session(sess)
graph = tf.get_default_graph()
model = load_model('./lenet.h5')

from art.estimators.classification import KerasClassifier
from art.attacks.evasion import HopSkipJump
classifier = KerasClassifier(clip_values=(0, 255), model=model)

app = Flask(__name__)
CORS(app, supports_credentials=True)
api = Api(app)

def predict(data):
    global sess
    global graph
    with graph.as_default():
        set_session(sess)
        res = np.argmax(model.predict(data))
    return res

class Fool(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('img', type=str)

    def get(self):
        data = self.parser.parse_args()
        img = data.get('img')
        img_data = img.split(',')
        img = np.array(img_data, np.float32).reshape(28, 28)
        img = img * 255.0
        img_new = np.zeros((1, 32, 32, 1))
        img_new[0] = np.pad(img.reshape(28, 28), [(2, ), (2, )], mode='constant').reshape(32, 32, 1)

        global sess
        global graph
        with graph.as_default():
            set_session(sess)
            attack = HopSkipJump(classifier=classifier, targeted=False, max_iter=0, max_eval=1000, init_eval=10)
            iter_step = 3
            x_adv = None
            for i in range(iter_step):
                x_adv = attack.generate(x=img_new, x_adv_init=x_adv, resume=True)

                #clear_output()
                # print("Adversarial image at step %d." % (i * iter_step),
                #     "and class label %d." % np.argmax(classifier.predict(x_adv)[0]))
                
                attack.max_iter = iter_step

        sav_img = Image.fromarray(x_adv.reshape(32, 32))
        sav_img = sav_img.convert("L")
        sav_img.save("test.jpg")
        buffer = BytesIO()
        sav_img.save(buffer,format="JPEG")
        myimage = buffer.getvalue()                     
        res = str(predict(x_adv))
        print("After Attack: ", res)

        return jsonify({'res': res, 'dat': bytes.decode(base64.b64encode(myimage))})

class Recognize(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('img', type=str)

    def get(self):
        data = self.parser.parse_args()
        img = data.get('img')
        img_data = img.split(',')
        img = np.array(img_data, np.float32).reshape(28, 28)
        img = img * 255.0
        img_new = np.zeros((1, 32, 32, 1))
        img_new[0] = np.pad(img.reshape(28, 28), [(2, ), (2, )], mode='constant').reshape(32, 32, 1)
        
        return str(predict(img_new))

api.add_resource(Recognize, '/')
api.add_resource(Fool, '/fool')

if __name__ == '__main__':
    app.run(debug=True)
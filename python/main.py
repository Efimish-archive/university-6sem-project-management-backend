from fastapi import FastAPI, UploadFile
import onnxruntime as ort
from PIL import Image
from torchvision import transforms
import torch
import io

alphabet=[symb for symb in '_ABEKMHOPCTYX0123456789']
let2int={i:let for let,i in enumerate(alphabet)}
int2let={let:i for let,i in enumerate(alphabet)}

def ctc_decoder(pred_string,int2let):
    new_string=[]
    perv_symb=-1
    for symb in pred_string:
        if symb.item()!=perv_symb:
            if symb.item()!=0:
                new_string.append(int2let[symb.item()])
        perv_symb=symb
    return ''.join(new_string)

app = FastAPI()
session = ort.InferenceSession("VehicleNumberRecognizer.onnx")

trans=transforms.Compose([
    transforms.Resize((64,128)),
    transforms.ToTensor()
])

@app.post("/predict")
async def predict(file: UploadFile):
    request_object_content = await file.read()
    img = Image.open(io.BytesIO(request_object_content)).convert('RGB')
    tensor_img=trans(img).unsqueeze(0)
    input_img=tensor_img.numpy()
    pred=session.run(None,{'input':input_img})
    pred=torch.from_numpy(pred[0])
    corected_pred=[ctc_decoder(word,int2let) for word in pred.argmax(dim=2).permute(1,0)]

    return {
        'number':corected_pred[0]
    }

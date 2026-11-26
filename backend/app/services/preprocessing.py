
import cv2
import torch
from PIL import Image
from torchvision import transforms


IMAGE_SIZE = 256

image_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def preprocess_mri(image_path):
    """Read, resize and zero-pad an MRI to 256x256."""

    image = cv2.imread(
        str(image_path),
        cv2.IMREAD_GRAYSCALE
    )

    if image is None:
        raise ValueError(
            f"Unreadable MRI: {image_path}"
        )

    height, width = image.shape

    resize_scale = min(
        IMAGE_SIZE / width,
        IMAGE_SIZE / height
    )

    resized_width = max(
        1, int(round(width * resize_scale))
    )

    resized_height = max(
        1, int(round(height * resize_scale))
    )

    interpolation = (
        cv2.INTER_AREA
        if resize_scale < 1
        else cv2.INTER_CUBIC
    )

    image = cv2.resize(
        image,
        (resized_width, resized_height),
        interpolation=interpolation
    )

    pad_left = (IMAGE_SIZE - resized_width) // 2
    pad_right = IMAGE_SIZE - resized_width - pad_left

    pad_top = (IMAGE_SIZE - resized_height) // 2
    pad_bottom = IMAGE_SIZE - resized_height - pad_top

    image = cv2.copyMakeBorder(
        image,
        pad_top,
        pad_bottom,
        pad_left,
        pad_right,
        borderType=cv2.BORDER_CONSTANT,
        value=0
    )

    return image


def prepare_model_input(image, device="cpu"):
    """Convert grayscale MRI to normalized 3-channel tensor."""

    rgb_image = Image.fromarray(image).convert("RGB")

    tensor = image_transform(rgb_image)

    return tensor.unsqueeze(0).to(
        torch.device(device)
    )

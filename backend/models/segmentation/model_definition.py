import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import resnet50, ResNet50_Weights

class DoubleConv(nn.Module):

    def __init__(self, in_channels, out_channels):

        super().__init__()

        self.block = nn.Sequential(

            nn.Conv2d(
                in_channels,
                out_channels,
                kernel_size=3,
                padding=1,
                bias=False
            ),

            nn.BatchNorm2d(out_channels),

            nn.ReLU(inplace=True),

            nn.Conv2d(
                out_channels,
                out_channels,
                kernel_size=3,
                padding=1,
                bias=False
            ),

            nn.BatchNorm2d(out_channels),

            nn.ReLU(inplace=True)
        )

    def forward(self, x):

        return self.block(x)

class AttentionGate(nn.Module):

    def __init__(
        self,
        gate_channels,
        skip_channels,
        intermediate_channels
    ):

        super().__init__()

        self.W_g = nn.Sequential(

            nn.Conv2d(
                gate_channels,
                intermediate_channels,
                kernel_size=1,
                bias=False
            ),

            nn.BatchNorm2d(intermediate_channels)
        )

        self.W_x = nn.Sequential(

            nn.Conv2d(
                skip_channels,
                intermediate_channels,
                kernel_size=1,
                bias=False
            ),

            nn.BatchNorm2d(intermediate_channels)
        )

        self.psi = nn.Sequential(

            nn.Conv2d(
                intermediate_channels,
                1,
                kernel_size=1
            ),

            nn.Sigmoid()
        )

        self.relu = nn.ReLU(inplace=True)

    def forward(self, g, x):

        g1 = self.W_g(g)
        x1 = self.W_x(x)

        attention = self.relu(g1 + x1)

        attention = self.psi(attention)

        return x * attention

class DecoderBlock(nn.Module):

    def __init__(
        self,
        in_channels,
        skip_channels,
        out_channels
    ):

        super().__init__()

        self.attention = AttentionGate(
            gate_channels=in_channels,
            skip_channels=skip_channels,
            intermediate_channels=max(
                out_channels // 2, 1
            )
        )

        self.conv = DoubleConv(
            in_channels + skip_channels,
            out_channels
        )

    def forward(self, x, skip):

        # Upsample decoder feature map.

        x = F.interpolate(
            x,
            size=skip.shape[2:],
            mode="bilinear",
            align_corners=False
        )

        # Gate the encoder feature map before concatenation.

        skip = self.attention(x, skip)

        # Concatenate gated encoder skip connection.

        x = torch.cat(
            [x, skip],
            dim=1
        )

        return self.conv(x)

class AttentionUNetResNet50(nn.Module):

    def __init__(self, pretrained=True):

        super().__init__()

        # ImageNet pretrained encoder.

        weights = (
            ResNet50_Weights.IMAGENET1K_V1
            if pretrained
            else None
        )

        encoder = resnet50(
            weights=weights
        )

        # ------------------------------------
        # ResNet50 encoder
        # ------------------------------------

        self.stem = nn.Sequential(
            encoder.conv1,
            encoder.bn1,
            encoder.relu
        )

        self.maxpool = encoder.maxpool

        self.encoder1 = encoder.layer1
        self.encoder2 = encoder.layer2
        self.encoder3 = encoder.layer3
        self.encoder4 = encoder.layer4

        # ------------------------------------
        # Attention U-Net decoder
        # ------------------------------------

        self.decoder1 = DecoderBlock(
            in_channels=2048,
            skip_channels=1024,
            out_channels=256
        )

        self.decoder2 = DecoderBlock(
            in_channels=256,
            skip_channels=512,
            out_channels=128
        )

        self.decoder3 = DecoderBlock(
            in_channels=128,
            skip_channels=256,
            out_channels=64
        )

        self.decoder4 = DecoderBlock(
            in_channels=64,
            skip_channels=64,
            out_channels=32
        )

        # ------------------------------------
        # Final segmentation head
        # ------------------------------------

        self.final_conv = nn.Sequential(

            nn.Conv2d(
                32,
                16,
                kernel_size=3,
                padding=1,
                bias=False
            ),

            nn.BatchNorm2d(16),

            nn.ReLU(inplace=True),

            nn.Conv2d(
                16,
                1,
                kernel_size=1
            )
        )

    def forward(self, x):

        input_size = x.shape[2:]

        # Encoder feature maps.

        e0 = self.stem(x)

        e1 = self.encoder1(
            self.maxpool(e0)
        )

        e2 = self.encoder2(e1)

        e3 = self.encoder3(e2)

        e4 = self.encoder4(e3)

        # Decoder with skip connections.

        d1 = self.decoder1(e4, e3)

        d2 = self.decoder2(d1, e2)

        d3 = self.decoder3(d2, e1)

        d4 = self.decoder4(d3, e0)

        # Restore original MRI resolution.

        output = F.interpolate(
            d4,
            size=input_size,
            mode="bilinear",
            align_corners=False
        )

        logits = self.final_conv(output)

        return logits


import torch
import torch.nn as nn

from torchvision.models import (
    mobilenet_v3_large,
    MobileNet_V3_Large_Weights
)


class MobileNetV3LargeClassifier(nn.Module):

    def __init__(
        self,
        num_classes=4,
        dropout=0.30,
        pretrained=False
    ):

        super().__init__()

        weights = (
            MobileNet_V3_Large_Weights.IMAGENET1K_V1
            if pretrained else None
        )

        backbone = mobilenet_v3_large(
            weights=weights
        )

        self.features = backbone.features
        self.avgpool = backbone.avgpool

        self.feature_dim = (
            backbone.classifier[0].in_features
        )

        self.classifier = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(
                self.feature_dim,
                num_classes
            )
        )

    def forward_features(self, x):

        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)

        return x

    def extract_features(self, x):

        return self.forward_features(x)

    def forward(self, x):

        features = self.forward_features(x)
        logits = self.classifier(features)

        return logits

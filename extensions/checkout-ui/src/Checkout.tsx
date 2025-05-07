import { useState, useEffect } from "react";
import {
  reactExtension,
  useApi,
  Text,
  BlockStack,
  Checkbox,
  Image,
  InlineLayout,
  Heading,
  Pressable,
  BlockSpacer,
  Divider,
  useCartLines,
  useApplyCartLinesChange
} from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.cart-line-list.render-after", () => (
  <Extension />
));

const variantID = "gid://shopify/ProductVariant/50375685767447"; // Replace with your variant ID
interface VariantData {
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  }
  image?: {
    url: string;
    altText: string;
  }
  product: {
    title: string;
    featuredImage: {
      url: string;
      altText: string;  
    }
  }
}

function Extension() {
  const { query } = useApi();
  const [variantData, setVariantData] = useState<null | VariantData>(null);
  const [isSelected, setIsSelected] = useState(false);

  const cartLines = useCartLines();
  const applyCartLineChange = useApplyCartLinesChange();
  useEffect(() => {
    async function getVariantData() {
      const queryResult = await query<{node: VariantData}>(`{
          node(id: "${variantID}") {
            ... on ProductVariant {
              title
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              } 
              product {
                title
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }`);
        if (queryResult.data) {
          setVariantData(queryResult.data.node);
        }
        console.log("queryResult", queryResult);
    }
    getVariantData();
  }, []);

/*   useEffect(() => {
    if (isSelected)
    { 
      applyCartLineChange({
        type: "addCartLine",
        quantity: 1,
        merchandiseId: variantID,
      })
    }else {
      const cartLineId = cartLines.find(
        cartLine => cartLine.merchandise.id === variantID
      )?.id

      if (cartLineId) {
        applyCartLineChange({
          type: "removeCartLine",
          id: cartLineId,
          quantity: 1,
        });
      }
    }
  },[isSelected]); */
  
  useEffect(() => {
    const cartLineId = cartLines.find(
      (cartLine) => cartLine.merchandise.id === variantID
    )?.id;
  
    if (isSelected && !cartLineId) {
      // Add the product to the cart if it's selected and not already in the cart
      applyCartLineChange({
        type: "addCartLine",
        quantity: 1,
        merchandiseId: variantID,
      });
    } else if (!isSelected && cartLineId) {
      // Remove the product from the cart if it's deselected and exists in the cart
      applyCartLineChange({
        type: "removeCartLine",
        id: cartLineId,
        quantity: 1,
      });
    }
  }, [isSelected, cartLines]);

  if (!variantData) return null;
  return (
    <>
    <Divider />
      <BlockSpacer 
        spacing="base"
      />
      <Heading level={2}>
        Other products you may like
      </Heading>
      <BlockSpacer 
        spacing="base"
      />
      <Pressable onPress={() => setIsSelected(!isSelected)}>
        <InlineLayout 
          blockAlignment="center" 
          spacing={["base", "base"]} 
          columns={["auto", 80, "fill"]}
          padding="base"
          >
          {/* <Checkbox 
            checked={isSelected} 
          /> */}
          <Checkbox 
            checked={isSelected || !!cartLines.find(cartLine => cartLine.merchandise.id === variantID)}
            disabled={!!cartLines.find(cartLine => cartLine.merchandise.id === variantID)}
          />
          <Image 
            source = { variantData.image?.url || variantData.product.featuredImage?.url} 
            accessibilityDescription = { variantData.image?.altText || variantData.product.featuredImage?.altText}
            borderRadius="base"
            border="base"
            borderWidth="base"
            cornerRadius="base"
            />
        <BlockStack>
          <Text>
            {variantData.product.title} - {variantData.title} 
          </Text>
          <Text>
            {variantData.price.amount} {variantData.price.currencyCode}
          </Text>
        </BlockStack>
        </InlineLayout>
      </Pressable>
    </>
  );
}

/* function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();


  // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
  if (!instructions.attributes.canUpdateAttributes) {
    // For checkouts such as draft order invoices, cart attributes may not be allowed
    // Consider rendering a fallback UI or nothing at all, if the feature is unavailable
    return (
      <Banner title="checkout-ui" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }

  // 3. Render a UI
  return (
    // <BlockStack border={"dotted"} padding={"tight"}>
    //   <Banner title="checkout-ui">
    //     {translate("welcome", {
    //       target: <Text emphasis="italic">{extension.target}</Text>,
    //     })}
    //   </Banner>
    //   <Checkbox onChange={onCheckboxChange}>
    //     {translate("iWouldLikeAFreeGiftWithMyOrder")}
    //   </Checkbox>
    // </BlockStack>
      <Text>Hello World!...</Text>
  );

  async function onCheckboxChange(isChecked) {
    // 4. Call the API to modify checkout
    const result = await applyAttributeChange({
      key: "requestedFreeGift",
      type: "updateAttribute",
      value: isChecked ? "yes" : "no",
    });
    console.log("applyAttributeChange result", result);
  }
} */
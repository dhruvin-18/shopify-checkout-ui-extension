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
  useApplyCartLinesChange,
  useAttributes,
} from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.cart-line-list.render-after", () => (
  <Extension />
));

const variantID = "gid://shopify/ProductVariant/50378977247511"; // Replace with your variant ID
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

  const attributes = useAttributes();
  const titleAttibute =  attributes.find(attribute => attribute.key === "app-title")?.value;

  const variantIdsAttribute = attributes.find(
    attribute => attribute.key === "app-variant-ids"
  )?.value?.split(",");  

  const [variantsData, setVariantsData] = useState<null | VariantData[]>(null);

  const cartLines = useCartLines();
  const applyCartLineChange = useApplyCartLinesChange();

  useEffect(() => {
    async function getVariantData(variantID: string): Promise< VariantData | null > {
      const queryResult = await query<{ node: VariantData }>(`{
          node(id: "gid://shopify/ProductVariant/${variantID}") {
            ... on ProductVariant {
              id
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
        console.log({queryResult});
        
        if(queryResult.errors){
          throw queryResult.errors
        }
        else {
          return queryResult.data.node
        }
      }

    async function getVariantsData() {
      const results = await Promise.allSettled(
        variantIdsAttribute.map(getVariantData)
      );
      const filteredResults = results
      .filter((item) => item.status === "fulfilled" &&  item.value !== null)
      .map((item) => (item as PromiseFulfilledResult<VariantData>).value);

      setVariantsData(filteredResults);      
    }  
    if (variantIdsAttribute) {
      getVariantsData();
    }
  }, []);

  async function handleUpsellProductClick(
    variantId: string,
    isInCart: boolean,
  ) {      
      if (isInCart)
      {
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
      }else {
        applyCartLineChange({
          type: "addCartLine",
          quantity: 1,
          merchandiseId: variantID,
        });
      }
    }

  if ( !variantsData || !variantID ) return null;
  return (
    <>
    <Divider />
      <BlockSpacer 
        spacing="base"
      />
      <Heading level={2}>
        { titleAttibute || "Other products you may like" }
      </Heading>
      <BlockSpacer 
        spacing="base"
      />
      { variantsData.map((variantData) => {
        const isInCart = Boolean (cartLines.find(cartLine => cartLine.merchandise.id === variantData.id));
        return (
          <Pressable onPress={() => handleUpsellProductClick(variantData.id, isInCart)} key={variantData.id}>
            <InlineLayout 
              blockAlignment="center" 
              spacing={["base", "base"]} 
              columns={["auto", 80, "fill"]}
              padding="base"
              >
              <Checkbox 
                checked={isInCart} 
              />
              <Image 
                source = { variantData.image?.url || variantData.product.featuredImage?.url} 
                accessibilityDescription = { variantData.image?.altText || variantData.product.featuredImage?.altText}
                borderRadius="base"
                border="base"
                borderWidth="base"
                cornerRadius="base"
                aspectRatio={1}
                fit = "contain"
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
        )
      })}
    </>
  );
}